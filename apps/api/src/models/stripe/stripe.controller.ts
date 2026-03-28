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

import { NotificationsService } from '../notifications/graphql/notifications.service'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { PubSub } from 'graphql-subscriptions'
import { PUB_SUB } from 'src/common/pubsub/pubsub.module'
import { Inject } from '@nestjs/common'
import { NotificationType } from '@prisma/client'
import { publishSlotAvailability } from 'src/common/pubsub/publish-slot-availability'

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly bookingService: BookingsService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
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

    // Notify customer
    try {
      await this.notificationsService.create({
        userId: bookingInput.customerId,
        title: 'Booking Confirmed',
        message: `Your booking #${newBooking.id} has been confirmed.`,
        type: NotificationType.BOOKING_CONFIRMED,
      })
    } catch { }

    // Notify garage manager
    try {
      const slot = await this.prisma.slot.findUnique({
        where: { id: newBooking.slotId },
        include: { Garage: { include: { Company: { include: { Managers: true } } } } },
      })
      for (const manager of slot?.Garage?.Company?.Managers ?? []) {
        await this.notificationsService.create({
          userId: manager.uid,
          title: 'New Booking',
          message: `A new booking #${newBooking.id} has been made at ${slot.Garage.displayName ?? 'your garage'}.`,
          type: NotificationType.NEW_BOOKING,
        })
      }
    } catch { }

    // Publish slot availability
    try {
      await publishSlotAvailability(
        this.pubSub,
        this.prisma,
        bookingInput.garageId,
        new Date(bookingInput.startTime),
        new Date(bookingInput.endTime),
      )
    } catch { }

    res.redirect(process.env.BOOKINGS_REDIRECT_URL)
  }
}
