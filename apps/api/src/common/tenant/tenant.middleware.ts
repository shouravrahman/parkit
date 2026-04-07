import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { TenantService } from './tenant.service'

@Injectable()
export class TenantMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user
    const companyId = user?.companyId || null

    this.tenantService.setTenant(companyId)
    ;(req as any).tenantId = companyId

    next()
  }
}
