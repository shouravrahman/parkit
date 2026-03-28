import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common'

import { PrismaService } from 'src/common/prisma/prisma.service'
import { QueueService } from 'src/common/queue/queue.service'
import { ApiTags } from '@nestjs/swagger'
import { CreateBooking } from './dtos/create.dto'
import { BookingQueryDto } from './dtos/query.dto'
import { UpdateBooking } from './dtos/update.dto'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { BookingEntity } from './entity/booking.entity'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/types'
import { checkRowLevelPermission } from 'src/common/auth/util'

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly prisma: PrismaService, private readonly queueService: QueueService) {}

  @AllowAuthenticated()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: BookingEntity })
  @Post()
  create(
    @Body() createBookingDto: CreateBooking,
    @GetUser() user: GetUserType,
  ) {
    checkRowLevelPermission(user, createBookingDto.customerId)
    return this.prisma.booking
      .create({ data: { ...createBookingDto, companyId: user.companyId } })
      .then(async (b) => {
        // enqueue background work for this booking (assign valet, notifications, payment finalization)
        try {
          await this.queueService.enqueueBookingPostProcess(b.id)
        } catch (err) {
          // don't fail request if queue is down; log to console for operators
          console.error('Failed to enqueue booking postprocess', err)
        }
        return b
      })
  }

  @ApiOkResponse({ type: [BookingEntity] })
  @AllowAuthenticated()
  @ApiBearerAuth()
  @Get()
  findAll(
    @Query() { skip, take, order, sortBy }: BookingQueryDto,
    @GetUser() user: GetUserType,
  ) {
    const where = user.companyId ? { companyId: user.companyId } : {}
    return this.prisma.booking.findMany({
      where,
      ...(skip ? { skip: +skip } : null),
      ...(take ? { take: +take } : null),
      ...(sortBy ? { orderBy: { [sortBy]: order || 'asc' } } : null),
    })
  }

  @ApiOkResponse({ type: BookingEntity })
  @AllowAuthenticated()
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: number, @GetUser() user: GetUserType) {
    const booking = await this.prisma.booking.findUnique({ where: { id } })
    checkRowLevelPermission(user, booking.customerId, ['admin'], booking.companyId)
    return booking
  }

  @ApiOkResponse({ type: BookingEntity })
  @ApiBearerAuth()
  @AllowAuthenticated()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBookingDto: UpdateBooking,
    @GetUser() user: GetUserType,
  ) {
    const booking = await this.prisma.booking.findUnique({ where: { id } })
    checkRowLevelPermission(user, booking.customerId, ['admin'], booking.companyId)
    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
    })
  }

  @ApiBearerAuth()
  @AllowAuthenticated()
  @Delete(':id')
  async remove(@Param('id') id: number, @GetUser() user: GetUserType) {
    const booking = await this.prisma.booking.findUnique({ where: { id } })
    checkRowLevelPermission(user, booking.customerId, ['admin'], booking.companyId)
    return this.prisma.booking.delete({ where: { id } })
  }
}
