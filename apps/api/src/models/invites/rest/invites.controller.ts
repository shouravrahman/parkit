import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common'
import { InvitesService } from '../invites.service'
import { Role } from '@prisma/client'
import { ApiTags } from '@nestjs/swagger'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/types'

@ApiTags('invites')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @AllowAuthenticated('manager')
  @Post()
  async createInvite(
    @Body('email') email: string,
    @Body('role') role: Role,
    @GetUser() user: GetUserType,
  ) {
    return this.invitesService.createInvite(email, role, user.companyId)
  }

  @Post('accept')
  async acceptInvite(
    @Body('token') token: string,
    @Body('uid') uid: string,
  ) {
    return this.invitesService.acceptInvite(token, uid)
  }
}
