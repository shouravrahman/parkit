import { Module } from '@nestjs/common'
import { NotificationsResolver } from './graphql/notifications.resolver'
import { NotificationsService } from './graphql/notifications.service'

@Module({
  providers: [NotificationsResolver, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
