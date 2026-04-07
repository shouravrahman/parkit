import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import StripeService from './stripe.service'
import { BookingsService } from '../bookings/graphql/bookings.service'
import { CreateStripeDto } from './dto/create-stripe-session.dto'
import { CreateBookingInput } from '../bookings/graphql/dtos/create-booking.input'
import { Response } from 'express'

import { NotificationService } from 'src/common/queue/notification.service'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { PubSub } from 'graphql-subscriptions'
import { PUB_SUB } from 'src/common/pubsub/pubsub.module'
import { Inject } from '@nestjs/common'
import { publishSlotAvailability } from 'src/common/pubsub/publish-slot-availability'

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly bookingService: BookingsService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Get()
  helloStripe() {
    return 'Hello Stripe'
  }

  @Post()
  create(@Body() createStripeDto: CreateStripeDto) {
    return this.stripeService.createStripeSession(createStripeDto)
  }

  @Get('success')
  async handleStripeSuccess(
    @Query('session_id') sessionId: string,
    @Res() res: Response,
  ) {
    if (!sessionId) {
      throw new BadRequestException('Session id missing.')
    }

    const session =
      await this.stripeService.stripe.checkout.sessions.retrieve(sessionId)

    const { uid, bookingData } = session.metadata

    const bookingInput: CreateBookingInput = JSON.parse(bookingData)
    const newBooking = await this.bookingService.create(bookingInput)

    const slot = await this.prisma.slot.findUnique({
      where: { id: newBooking.slotId },
      include: { Garage: true },
    })

    await this.notificationService.sendBookingConfirmed(
      newBooking.id,
      bookingInput.customerId,
      slot?.Garage?.displayName || 'the garage',
    )

    const managers = await this.prisma.manager.findMany({
      where: { companyId: slot?.Garage?.companyId },
    })
    for (const manager of managers) {
      await this.notificationService.sendNewBooking(
        newBooking.id,
        manager.uid,
        'Customer',
        new Date().toLocaleTimeString(),
      )
    }

    try {
      await publishSlotAvailability(
        this.pubSub,
        this.prisma,
        bookingInput.garageId,
        new Date(bookingInput.startTime),
        new Date(bookingInput.endTime),
      )
    } catch {}

    res.redirect(process.env.BOOKINGS_REDIRECT_URL)
  }
}
