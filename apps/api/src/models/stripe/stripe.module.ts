import { Module } from '@nestjs/common'

import { NotificationsModule } from '../notifications/notifications.module'
import { PubSubModule } from 'src/common/pubsub/pubsub.module'
import { StripeController } from './stripe.controller'
import StripeService from './stripe.service'
import { BookingsService } from '../bookings/graphql/bookings.service'

@Module({
  imports: [NotificationsModule, PubSubModule],
  controllers: [StripeController],
  providers: [StripeService, BookingsService],
})
export class StripeModule {}
