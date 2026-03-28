import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

@Injectable()
export class MailService {
  private resend: Resend
  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'))
  }

  async sendUserInvitation(email: string, token: string, role: string) {
    const managerUrl = this.configService.get('MANAGER_APP_URL') || 'http://localhost:3001'
    const valetUrl = this.configService.get('VALET_APP_URL') || 'http://localhost:3002'

    const baseUrl = role === 'VALET' ? valetUrl : managerUrl
    const url = `${baseUrl}/accept-invite?token=${token}`

    await this.resend.emails.send({
      from: 'Parkit <onboarding@resend.dev>',
      to: [email],
      subject: `Welcome to Parkit! You are invited as a ${role.toLowerCase()}.`,
      html: `
        <h1>Welcome to Parkit!</h1>
        <p>You have been invited to join a company on Parkit as a <strong>${role.toLowerCase()}</strong>.</p>
        <p><a href="${url}">Click here to accept the invitation</a></p>
      `,
    })
  }
}
