import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Worker, Queue } from 'bullmq'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { BOOKING_QUEUE_NAME } from './queue.constants'
import { getRedisConnectionOptions } from './utils'
import Redis from 'ioredis'

@Injectable()
export class BookingWorkerService implements OnModuleInit, OnModuleDestroy {
  private worker: Worker | null = null

  constructor(private config: ConfigService, private prisma: PrismaService) {}

  async onModuleInit() {
    const REDIS_URL = this.config.get<string>('REDIS_URL') || process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    const connectionOptions = await getRedisConnectionOptions(REDIS_URL)

    this.worker = new Worker(
      BOOKING_QUEUE_NAME,
      async (job) => {
        const { bookingId } = job.data as { bookingId: number }
        console.log('Worker processing booking', bookingId)

        try {
          await this.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
              where: { id: bookingId },
              include: { ValetAssignment: true, Slot: { include: { Garage: true } } },
            })

            if (!booking) {
              console.warn('Booking not found', bookingId)
              return
            }

            // If assignment already exists with an allocated valet, we are idempotent and can stop.
            if (booking.ValetAssignment?.pickupValetId || booking.ValetAssignment?.returnValetId) {
              console.log('Booking already assigned to valet, skipping', bookingId)
              return
            }

            const companyId = booking.Slot?.Garage?.companyId
            if (!companyId) {
              console.warn('Booking has no company/garage information, skipping assignment', bookingId)
              return
            }

            // Select candidate valets for the company and choose the one with fewest assignments
            const valets = await tx.valet.findMany({
              where: { companyId },
              include: { PickupAssignments: true, ReturnAssignments: true },
            })

            let chosen = null
            let min = Number.POSITIVE_INFINITY
            for (const v of valets) {
              const count = (v.PickupAssignments?.length || 0) + (v.ReturnAssignments?.length || 0)
              if (count < min) {
                min = count
                chosen = v
              }
            }

            if (!chosen) {
              // No valets available right now. Let BullMQ handle retries.
              throw new Error('No available valets at this time.')
            }

            // Update or Create ValetAssignment and update booking status + timeline atomically.
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
                  },
                })
              }
            } catch (e: any) {
              // If another worker created the assignment concurrently, abort gracefully.
              const already = await tx.valetAssignment.findUnique({ where: { bookingId: booking.id } })
              if (already) {
                console.log('Concurrent assignment detected, aborting create step', bookingId)
                return
              }
              throw e
            }

            await tx.booking.update({ where: { id: booking.id }, data: { status: 'VALET_ASSIGNED_FOR_CHECK_IN' } })

            await tx.bookingTimeline.create({
              data: {
                bookingId: booking.id,
                status: 'VALET_ASSIGNED_FOR_CHECK_IN',
                valetId: chosen.uid,
              },
            })
          })

          console.log('Processed booking', bookingId)
        } catch (err) {
          console.error('Worker error processing booking', bookingId, err)
          // Let the job fail so BullMQ can handle retries according to job options.
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

      // If we have exhausted all retries, trigger the Automated Dead Letter Fallback
      if (attemptsMade >= maxAttempts && job?.data?.bookingId) {
        const bookingId = job.data.bookingId
        console.log(`Max retries reached for booking ${bookingId}. Triggering automated cancellation.`)
        
        try {
          const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { Slot: { include: { Garage: { include: { Company: { include: { Managers: true } } } } } } }
          })
          
          if (booking && booking.status !== 'CANCELLED') {
            await this.prisma.$transaction(async (tx) => {
              await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' }
              })
              await tx.bookingTimeline.create({
                data: { bookingId, status: 'CANCELLED' as any }
              })
              
              // 1. Notify Customer (Push Notification Simulation)
              await tx.notification.create({
                data: {
                  userId: booking.customerId,
                  title: 'Booking Cancelled',
                  message: "We're sorry, all of our valets are currently busy. Your booking has been cancelled and your card will not be charged.",
                  type: 'BOOKING_STATUS_UPDATED',
                }
              })
              
              // 2. Alert Manager Dashboard
              const managers = booking.Slot?.Garage?.Company?.Managers || []
              for (const m of managers) {
                await tx.notification.create({
                  data: {
                    userId: m.uid,
                    title: 'Unassigned Booking Cancelled',
                    message: `Booking #${bookingId} was automatically cancelled because no valets were available after maximum retries.`,
                    type: 'BOOKING_STATUS_UPDATED',
                  }
                })
              }
            })
            console.log(`Successfully cancelled booking ${bookingId} and notified customer/managers.`)
          }
        } catch (fallbackErr) {
          console.error(`Failed to execute fallback cancellation for booking ${bookingId}`, fallbackErr)
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
