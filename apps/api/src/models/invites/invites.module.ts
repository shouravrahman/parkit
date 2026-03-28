import { Module } from '@nestjs/common'
import { InvitesService } from './invites.service'
import { InvitesController } from './rest/invites.controller'
import { MailModule } from 'src/common/mail/mail.module'

@Module({
  imports: [MailModule],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
