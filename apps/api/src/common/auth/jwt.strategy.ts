import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from 'src/common/prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  // Called after token is validated. Return value becomes req.user
  async validate(payload: any) {
    const uid = payload?.uid
    if (!uid) throw new UnauthorizedException('Invalid token payload')

    const user = await this.prisma.user.findUnique({ where: { uid } })
    if (!user) throw new UnauthorizedException('User not found')

    // Resolve roles similarly to previous implementation
    const roles: string[] = []
    const [admin, manager, valet] = await Promise.all([
      this.prisma.admin.findUnique({ where: { uid } }),
      this.prisma.manager.findUnique({ where: { uid } }),
      this.prisma.valet.findUnique({ where: { uid } }),
    ])

    admin && roles.push('admin')
    manager && roles.push('manager')
    valet && roles.push('valet')

    // Attach roles and any other useful fields from payload
    return { ...payload, roles, companyId: manager?.companyId || valet?.companyId }
  }
}
