import { Injectable } from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class TenantService {
  private tenantId: number | null = null

  setTenant(companyId: number | null) {
    this.tenantId = companyId
  }

  getTenantId(): number | null {
    return this.tenantId
  }

  getTenantIdOrThrow(): number {
    if (!this.tenantId) {
      throw new Error('No tenant context available')
    }
    return this.tenantId
  }

  static getTenantIdFromRequest(req: Request): number | null {
    return (req as any).tenantId || (req as any).user?.companyId || null
  }
}
