import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Worker } from 'bullmq'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { BOOKING_QUEUE_NAME } from './queue.constants'
import { getRedisConnectionOptions } from './utils'
import { NotificationService } from './notification.service'
import Redis from 'ioredis'

@Injectable()
export class BookingWorkerService implements OnModuleInit, OnModuleDestroy {
  private worker: Worker | null = null

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    const REDIS_URL =
      this.config.get<string>('REDIS_URL') ||
      process.env.REDIS_URL ||
      'redis://127.0.0.1:6379'
    const connectionOptions = await getRedisConnectionOptions(REDIS_URL)

    this.worker = new Worker(
      BOOKING_QUEUE_NAME,
      async (job) => {
        const { bookingId } = job.data as { bookingId: number }
        console.log('Worker processing booking', bookingId)

        try {
          const result = await this.prisma.$transaction(async (tx) => {
            function getDistanceKm(
              lat1: number,
              lon1: number,
              lat2: number,
              lon2: number,
            ) {
              const p = 0.017453292519943295
              const c = Math.cos
              const a =
                0.5 -
                c((lat2 - lat1) * p) / 2 +
                (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2
              return 12742 * Math.asin(Math.sqrt(a))
            }

            const booking = await tx.booking.findUnique({
              where: { id: bookingId },
              include: {
                ValetAssignment: true,
                Slot: { include: { Garage: { include: { Address: true } } } },
              },
            })

            if (!booking) {
              console.warn('Booking not found', bookingId)
              return
            }

            if (
              booking.ValetAssignment?.pickupValetId ||
              booking.ValetAssignment?.returnValetId
            ) {
              console.log(
                'Booking already assigned to valet, skipping',
                bookingId,
              )
              return
            }

            const companyId = booking.Slot?.Garage?.companyId
            if (!companyId) {
              console.warn(
                'Booking has no company/garage information, skipping assignment',
                bookingId,
              )
              return
            }

            const valets = await tx.valet.findMany({
              where: { companyId },
              include: {
                PickupAssignments: {
                  include: {
                    Booking: {
                      include: {
                        Slot: {
                          include: { Garage: { include: { Address: true } } },
                        },
                      },
                    },
                  },
                },
                ReturnAssignments: {
                  include: {
                    Booking: {
                      include: {
                        Slot: {
                          include: { Garage: { include: { Address: true } } },
                        },
                      },
                    },
                  },
                },
              },
            })

            const newBookingAddr = booking.Slot?.Garage?.Address

            let chosen = null
            let bestScore = Number.POSITIVE_INFINITY

            for (const v of valets) {
              let hasOverlap = false
              let lastKnownLoc = null
              let maxEndTime = new Date(0)

              const allAssignments = [
                ...(v.PickupAssignments || []),
                ...(v.ReturnAssignments || []),
              ]

              for (const assignment of allAssignments) {
                const existing = assignment.Booking
                if (
                  existing.status !== 'CANCELLED' &&
                  existing.status !== 'VALET_RETURNED'
                ) {
                  const overlaps =
                    existing.startTime < booking.endTime &&
                    existing.endTime > booking.startTime
                  if (overlaps) {
                    hasOverlap = true
                    break
                  }
                }

                if (
                  existing.endTime > maxEndTime &&
                  existing.Slot?.Garage?.Address
                ) {
                  maxEndTime = existing.endTime
                  lastKnownLoc = existing.Slot.Garage.Address
                }
              }

              if (hasOverlap) {
                continue
              }

              let distanceScore = 0
              if (lastKnownLoc && newBookingAddr) {
                distanceScore = getDistanceKm(
                  newBookingAddr.lat,
                  newBookingAddr.lng,
                  lastKnownLoc.lat,
                  lastKnownLoc.lng,
                )
              }

              const workloadScore = allAssignments.length
              const totalScore = distanceScore + workloadScore

              if (totalScore < bestScore) {
                bestScore = totalScore
                chosen = v
              }
            }

            if (!chosen) {
              throw new Error('No available valets at this time.')
            }

            try {
              if (booking.ValetAssignment) {
                await tx.valetAssignment.update({
                  where: { bookingId: booking.id },
                  data: { pickupValetId: chosen.uid },
                })
              } else {
                await tx.valetAssignment.create({
                  data: {
                    bookingId: booking.id,
                    pickupValetId: chosen.uid,
                    companyId,
                  },
                })
              }
            } catch (e: any) {
              const already = await tx.valetAssignment.findUnique({
                where: { bookingId: booking.id },
              })
              if (already) {
                console.log(
                  'Concurrent assignment detected, aborting create step',
                  bookingId,
                )
                return
              }
              throw e
            }

            await tx.booking.update({
              where: { id: booking.id },
              data: { status: 'VALET_ASSIGNED_FOR_CHECK_IN' },
            })

            await tx.bookingTimeline.create({
              data: {
                bookingId: booking.id,
                status: 'VALET_ASSIGNED_FOR_CHECK_IN',
                valetId: chosen.uid,
                companyId,
              },
            })

            return { booking, chosen }
          })

          console.log('Processed booking', bookingId)

          if (result) {
            try {
              await this.notificationService.sendValetAssigned(
                result.booking.id,
                result.booking.customerId,
                result.chosen.displayName,
              )
            } catch (e) {
              console.error('Failed to send valet assigned notification', e)
            }
          }
        } catch (err) {
          console.error('Worker error processing booking', bookingId, err)
          throw err
        }
      },
      {
        connection: new Redis((connectionOptions as any).url, {
          maxRetriesPerRequest: null,
          tls: (connectionOptions as any).tls,
        }),
      },
    )

    this.worker.on('completed', (job) => console.log('Job completed', job.id))

    this.worker.on('failed', async (job, err) => {
      console.error(`Job failed ${job?.id}`, err.message)
      const attemptsMade = job?.attemptsMade || 0
      const maxAttempts = job?.opts?.attempts || 1

      if (attemptsMade >= maxAttempts && job?.data?.bookingId) {
        const bookingId = job.data.bookingId
        console.log(
          `Max retries reached for booking ${bookingId}. Triggering automated cancellation.`,
        )

        try {
          const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
              Slot: {
                include: {
                  Garage: {
                    include: { Company: { include: { Managers: true } } },
                  },
                },
              },
            },
          })

          if (booking && booking.status !== 'CANCELLED') {
            await this.prisma.$transaction(async (tx) => {
              await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' },
              })
              await tx.bookingTimeline.create({
                data: { bookingId, status: 'CANCELLED' as any },
              })

              const companyId = booking.Slot?.Garage?.companyId

              await this.notificationService.sendBookingCancelled(
                bookingId,
                booking.customerId,
                "We're sorry, all of our valets are currently busy. Your booking has been cancelled and your card will not be charged.",
              )

              const managers = booking.Slot?.Garage?.Company?.Managers || []
              for (const m of managers) {
                await this.notificationService.send({
                  userId: m.uid,
                  title: 'Unassigned Booking Cancelled',
                  message: `Booking #${bookingId} was automatically cancelled because no valets were available after maximum retries.`,
                  type: 'BOOKING_STATUS_UPDATED',
                  metadata: { bookingId, companyId },
                })
              }
            })
            console.log(
              `Successfully cancelled booking ${bookingId} and notified customer/managers.`,
            )
          }
        } catch (fallbackErr) {
          console.error(
            `Failed to execute fallback cancellation for booking ${bookingId}`,
            fallbackErr,
          )
        }
      }
    })

    console.log('BookingWorkerService started')
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close()
      this.worker = null
    }
  }
}

export default BookingWorkerService
