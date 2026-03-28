import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { MailService } from 'src/common/mail/mail.service'
import { v4 as uuidv4 } from 'uuid'
import { Role } from '@prisma/client'

@Injectable()
export class InvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async createInvite(email: string, role: Role, companyId: number) {
    const token = uuidv4()
    const invite = await this.prisma.invite.create({
      data: {
        email,
        role,
        token,
        companyId,
      },
    })

    await this.mailService.sendUserInvitation(email, token, role)
    return invite
  }

  async acceptInvite(token: string, uid: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
    })

    if (!invite || invite.accepted) {
      throw new NotFoundException('Invalid or already accepted invitation.')
    }

    await this.prisma.$transaction([
      this.prisma.invite.update({
        where: { id: invite.id },
        data: { accepted: true },
      }),
      // Create the appropriate role record
      invite.role === Role.MANAGER
        ? this.prisma.manager.create({
            data: { uid, companyId: invite.companyId },
          })
        : this.prisma.valet.create({
            data: { uid, companyId: invite.companyId, displayName: 'New Valet' },
          }),
    ])

    return { success: true }
  }
}
