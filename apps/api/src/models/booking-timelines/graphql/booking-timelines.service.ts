import { Injectable, ForbiddenException } from '@nestjs/common'
import {
  FindManyBookingTimelineArgs,
  FindUniqueBookingTimelineArgs,
} from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateBookingTimelineInput } from './dtos/create-booking-timeline.input'
import { UpdateBookingTimelineInput } from './dtos/update-booking-timeline.input'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class BookingTimelinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create(createBookingTimelineInput: CreateBookingTimelineInput) {
    const tenantId = this.tenantService.getTenantId()
    return this.prisma.bookingTimeline.create({
      data: {
        ...createBookingTimelineInput,
        companyId:
          createBookingTimelineInput.companyId || tenantId || undefined,
      },
    })
  }

  async findAll(args: FindManyBookingTimelineArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId) {
      return this.prisma.bookingTimeline.findMany({
        ...args,
        where: {
          ...where,
          companyId: tenantId,
        },
      })
    }

    return this.prisma.bookingTimeline.findMany(args)
  }

  async findOne(args: FindUniqueBookingTimelineArgs) {
    const tenantId = this.tenantService.getTenantId()

    const timeline = await this.prisma.bookingTimeline.findUnique({
      where: args.where,
      include: {
        Booking: { include: { Slot: { include: { Garage: true } } } },
      },
    })

    if (!timeline) return null

    if (tenantId && timeline.Booking?.Slot?.Garage?.companyId !== tenantId) {
      return null
    }

    return timeline
  }

  async update(updateBookingTimelineInput: UpdateBookingTimelineInput) {
    const tenantId = this.tenantService.getTenantId()
    const { id, ...data } = updateBookingTimelineInput

    const timeline = await this.prisma.bookingTimeline.findUnique({
      where: { id },
      include: {
        Booking: { include: { Slot: { include: { Garage: true } } } },
      },
    })
    if (!timeline) throw new Error('Timeline not found')

    if (tenantId && timeline.Booking?.Slot?.Garage?.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.bookingTimeline.update({
      where: { id },
      data: data,
    })
  }

  async remove(args: FindUniqueBookingTimelineArgs) {
    const tenantId = this.tenantService.getTenantId()

    const timeline = await this.prisma.bookingTimeline.findUnique({
      where: args.where,
      include: {
        Booking: { include: { Slot: { include: { Garage: true } } } },
      },
    })
    if (!timeline) throw new Error('Timeline not found')

    if (tenantId && timeline.Booking?.Slot?.Garage?.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.bookingTimeline.delete(args)
  }
}
