import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import * as jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const ACCESS_TOKEN_EXP = '15m' // short lived
const REFRESH_TOKEN_TTL_DAYS = 30

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  private async resolveRoles(uid: string) {
    const roles: string[] = []
    const [admin, manager, valet] = await Promise.all([
      this.prisma.admin.findUnique({ where: { uid } }),
      this.prisma.manager.findUnique({ where: { uid } }),
      this.prisma.valet.findUnique({ where: { uid } }),
    ])
    admin && roles.push('admin')
    manager && roles.push('manager')
    valet && roles.push('valet')
    return roles
  }

  async register(email: string, password: string, name?: string) {
    const existing = await this.prisma.credentials.findUnique({ where: { email } })
    if (existing) throw new BadRequestException('Email already registered')

    const uid = uuidv4()
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user + credentials
    await this.prisma.user.create({
      data: {
        uid,
        name,
        Credentials: { create: { email, passwordHash } },
      },
    })

    const roles = await this.resolveRoles(uid)
    const accessToken = this.signAccessToken(uid, roles)
    const refresh = await this.createRefreshToken(uid)

    return { accessToken, refreshToken: refresh }
  }

  private signAccessToken(uid: string, roles: string[]) {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('Missing JWT_SECRET environment variable')
    return jwt.sign({ uid, roles }, secret, { expiresIn: ACCESS_TOKEN_EXP })
  }

  private async createRefreshToken(uid: string) {
    // token format: <id>.<secret> where secret is hashed in DB
    const id = uuidv4()
    const secret = uuidv4() + uuidv4()
    const tokenPlain = `${id}.${secret}`
    const tokenHash = await bcrypt.hash(secret, 10)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS)

    await (this.prisma as any).refreshToken.create({
      data: { id, uid, tokenHash, expiresAt },
    })

    return tokenPlain
  }

  async validateCredentials(email: string, password: string) {
    const cred = await this.prisma.credentials.findUnique({ where: { email } })
    if (!cred) throw new UnauthorizedException('Invalid credentials')

    const ok = await bcrypt.compare(password, cred.passwordHash)
    if (!ok) throw new UnauthorizedException('Invalid credentials')

    const uid = cred.uid
    const roles = await this.resolveRoles(uid)
    const accessToken = this.signAccessToken(uid, roles)
    const refreshToken = await this.createRefreshToken(uid)

    return { accessToken, refreshToken }
  }

  async rotateRefreshToken(refreshToken: string) {
    const [id, secret] = (refreshToken || '').split('.')
    if (!id || !secret) throw new UnauthorizedException('Invalid refresh token')

  const record = await (this.prisma as any).refreshToken.findUnique({ where: { id } })
    if (!record || record.revoked) throw new UnauthorizedException('Invalid refresh token')
    if (record.expiresAt && record.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expired')

    const match = await bcrypt.compare(secret, record.tokenHash)
    if (!match) throw new UnauthorizedException('Invalid refresh token')

    // rotate: revoke current and create new one
  await (this.prisma as any).refreshToken.update({ where: { id }, data: { revoked: true } })

    const newToken = await this.createRefreshToken(record.uid)
    const roles = await this.resolveRoles(record.uid)
    const accessToken = this.signAccessToken(record.uid, roles)

    return { accessToken, refreshToken: newToken }
  }

  async revoke(refreshToken: string) {
    const [id] = (refreshToken || '').split('.')
    if (!id) return
  await (this.prisma as any).refreshToken.updateMany({ where: { id }, data: { revoked: true } })
  }
}
