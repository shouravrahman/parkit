import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { FindManyBookingArgs, FindUniqueBookingArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateBookingInput } from './dtos/create-booking.input'
import { UpdateBookingInput } from './dtos/update-booking.input'
import { generateSixDigitNumber } from 'src/common/util'
import { SlotType } from '@prisma/client'
import { Queue } from 'bullmq'
import { getRedisConnectionOptions } from 'src/common/queue/utils'
import Redis from 'ioredis'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create({
    customerId,
    endTime,
    garageId,
    startTime,
    type,
    vehicleNumber,
    phoneNumber,
    pricePerHour,
    totalPrice,
    valetAssignment,
  }: CreateBookingInput) {
    const customer = await this.prisma.customer.findUnique({
      where: { uid: customerId },
    })

    if (!customer?.uid) {
      await this.prisma.customer.create({
        data: { uid: customerId },
      })
    }

    const passcode = generateSixDigitNumber().toString()

    let startDate: Date
    let endDate: Date

    if (typeof startTime === 'string') {
      startDate = new Date(startTime)
    }
    if (typeof endTime === 'string') {
      endDate = new Date(endTime)
    }

    const slot = await this.getFreeSlot({
      endTime: endDate,
      startTime: startDate,
      garageId,
      type,
    })

    if (!slot) {
      throw new NotFoundException('No slots found.')
    }

    const garage = await this.prisma.garage.findUnique({
      where: { id: garageId },
    })

    return this.prisma
      .$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            endTime: new Date(endTime).toISOString(),
            startTime: new Date(startTime).toISOString(),
            vehicleNumber,
            customerId,
            phoneNumber,
            passcode,
            slotId: slot.id,
            pricePerHour,
            totalPrice,
            companyId: garage?.companyId,
            ...(valetAssignment
              ? {
                  ValetAssignment: {
                    create: {
                      ...valetAssignment,
                      companyId: garage?.companyId,
                    },
                  },
                }
              : null),
          },
        })
        await tx.bookingTimeline.create({
          data: {
            bookingId: booking.id,
            status: 'BOOKED',
            companyId: garage?.companyId,
          },
        })

        return booking
      })
      .then(async (booking) => {
        try {
          const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
          const connectionOptions = await getRedisConnectionOptions(REDIS_URL)
          const connection = new Redis((connectionOptions as any).url, {
            maxRetriesPerRequest: null,
            tls: (connectionOptions as any).tls,
          })
          const bookingQueue = new Queue('booking:postprocess', { connection })

          await bookingQueue.add(
            `postprocess-${booking.id}`,
            { bookingId: booking.id },
            {
              attempts: 2,
              backoff: { type: 'fixed', delay: 5000 },
            },
          )

          await bookingQueue.close()
        } catch (e) {
          console.error('Failed to queue booking for worker processing', e)
        }
        return booking
      })
  }

  async findAll(args: FindManyBookingArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId) {
      return this.prisma.booking.findMany({
        ...args,
        where: {
          ...where,
          companyId: tenantId,
        },
      })
    }

    return this.prisma.booking.findMany(args)
  }

  async findOne(args: FindUniqueBookingArgs) {
    const tenantId = this.tenantService.getTenantId()

    const booking = await this.prisma.booking.findUnique({
      where: args.where,
      include: { Slot: { include: { Garage: true } } },
    })

    if (!booking) return null

    if (tenantId && booking.companyId !== tenantId) {
      return null
    }

    return booking
  }

  async update(updateBookingInput: UpdateBookingInput) {
    const tenantId = this.tenantService.getTenantId()
    const { id, ...data } = updateBookingInput

    const booking = await this.prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new Error('Booking not found')

    if (tenantId && booking.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.booking.update({
      where: { id },
      data: { ...data, companyId: booking.companyId },
    })
  }

  async remove(args: FindUniqueBookingArgs) {
    const tenantId = this.tenantService.getTenantId()

    const booking = await this.prisma.booking.findUnique({ where: args.where })
    if (!booking) throw new Error('Booking not found')

    if (tenantId && booking.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.booking.delete(args)
  }

  getFreeSlot({
    garageId,
    startTime,
    endTime,
    type,
  }: {
    garageId: number
    startTime: string | Date
    endTime: string | Date
    type: SlotType
  }) {
    return this.prisma.slot.findFirst({
      where: {
        garageId: garageId,
        type: type,
        Bookings: {
          none: {
            OR: [
              { startTime: { lt: endTime }, endTime: { gt: startTime } },
              { startTime: { gt: startTime }, endTime: { lt: endTime } },
            ],
          },
        },
      },
    })
  }
}
