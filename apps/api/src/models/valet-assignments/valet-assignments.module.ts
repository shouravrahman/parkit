import { Module } from '@nestjs/common'
import { ValetAssignmentsService } from './graphql/valet-assignments.service'
import { ValetAssignmentsResolver } from './graphql/valet-assignments.resolver'
import { ValetAssignmentsController } from './rest/valet-assignments.controller'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  providers: [ValetAssignmentsResolver, ValetAssignmentsService],
  exports: [ValetAssignmentsService],
  controllers: [ValetAssignmentsController],
})
export class ValetAssignmentsModule { }
