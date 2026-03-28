import { Worker } from 'bullmq'
import { PrismaClient, BookingStatus } from '@prisma/client'

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const prisma = new PrismaClient()

const worker = new Worker(
  'booking:postprocess',
  async (job) => {
    const { bookingId } = job.data as { bookingId: number }
    console.log('Processing booking postprocess job for', bookingId)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ValetAssignment: true },
    })

    if (!booking) {
      console.warn('Booking not found, skipping', bookingId)
      return
    }

    // Idempotency check: already assigned?
    if (booking.ValetAssignment) {
      console.log('Booking already has an assignment, skipping', bookingId)
      return
    }

    const companyId = booking.companyId
    if (!companyId) {
      console.error('Booking has no companyId, cannot assign valet', bookingId)
      return
    }

    // Find a valet in the same company (simple pick for now)
    const valet = await prisma.valet.findFirst({
      where: { companyId },
    })

    if (!valet) {
      console.warn('No valet available for company', companyId)
      // in production, you might want to requeue with delay or notify admin
      return
    }

    // Atomically create assignment and update status
    await prisma.$transaction([
      prisma.valetAssignment.create({
        data: {
          bookingId: booking.id,
          pickupValetId: valet.uid,
          companyId: companyId,
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.VALET_ASSIGNED_FOR_CHECK_IN },
      }),
      prisma.bookingTimeline.create({
        data: {
          bookingId: booking.id,
          status: BookingStatus.VALET_ASSIGNED_FOR_CHECK_IN,
          valetId: valet.uid,
          companyId: companyId,
        },
      }),
    ])

    console.log(`Booking ${bookingId} successfully assigned to valet ${valet.uid}`)
  },
  {
    connection: {
      url: REDIS_URL,
    } as any, // BullMQ Worker options accept a connection object.
  },
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

console.log('Booking worker started, listening on booking:postprocess')
