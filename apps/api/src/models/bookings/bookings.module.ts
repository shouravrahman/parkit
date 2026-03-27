import { Module } from '@nestjs/common'
import { BookingsService } from './graphql/bookings.service'
import { BookingsResolver } from './graphql/bookings.resolver'
import { BookingsController } from './rest/bookings.controller'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  providers: [BookingsResolver, BookingsService],
  exports: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule { }
