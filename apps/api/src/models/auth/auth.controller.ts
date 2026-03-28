import { Body, Controller, Post, Req } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; name?: string }) {
    const { email, password, name } = body
    return this.authService.register(email, password, name)
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body
    return this.authService.validateCredentials(email, password)
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.rotateRefreshToken(body.refreshToken)
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }) {
    await this.authService.revoke(body.refreshToken)
    return { ok: true }
  }
}
