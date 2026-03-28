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

            // If assignment already exists, we are idempotent and can stop.
            if (booking.ValetAssignment) {
              console.log('Booking already has ValetAssignment, skipping', bookingId)
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
              // No available valets now. Requeue the job with a delay so operator can add valets or load reduces.
              console.warn('No valets available, requeueing job with delay', bookingId)
              const connection = new Redis((connectionOptions as any).url, {
                maxRetriesPerRequest: null,
                tls: (connectionOptions as any).tls,
              })
              const q = new Queue('booking:postprocess', { connection })
              // small delay (e.g., 30s). If many retries are needed, BullMQ backoff/retries can be configured when scheduling.
              await q.add(`retry-${bookingId}-${Date.now()}`, { bookingId }, { delay: 30_000 })
              await q.close()
              return
            }

            // Create ValetAssignment and update booking status + timeline atomically.
            try {
              await tx.valetAssignment.create({
                data: {
                  bookingId: booking.id,
                  pickupValetId: chosen.uid,
                },
              })
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
    this.worker.on('failed', (job, err) => console.error('Job failed', job?.id, err))

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
