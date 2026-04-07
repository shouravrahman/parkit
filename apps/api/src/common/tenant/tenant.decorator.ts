import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return (request as any).tenantId || (request as any).user?.companyId || null
  },
)
