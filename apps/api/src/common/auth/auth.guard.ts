import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Reflector } from '@nestjs/core'
import { Role } from 'src/common/types'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'

// This class adapts the passport JWT guard to GraphQL and preserves
// the previous role-checking behavior via reflector metadata.
@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private readonly reflector: Reflector, private readonly prisma: PrismaService) {
    super()
  }

  // For GraphQL, extract the request from the GQL context so passport can read headers
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }

  // After passport validates and populates req.user, we still need to enforce roles
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // first run passport's JWT check
    const result = (await super.canActivate(context)) as boolean

    if (!result) return false

    const req = this.getRequest(context)
    // ensure roles are present on req.user (JwtStrategy attaches them)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])

    // If no roles required, allow
    if (!requiredRoles || requiredRoles.length === 0) return true

    // If strategy didn't attach roles, fall back to DB lookup
    let userRoles: Role[] = req.user?.roles || []
    if (!userRoles || userRoles.length === 0) {
      userRoles = await this.getUserRoles(req.user?.uid)
      req.user.roles = userRoles
    }

    return requiredRoles.some((role) => userRoles.includes(role))
  }

  private async getUserRoles(uid: string): Promise<Role[]> {
    const roles: Role[] = []

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
}
