import { Injectable, ForbiddenException } from '@nestjs/common'
import { FindManyManagerArgs, FindUniqueManagerArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateManagerInput } from './dtos/create-manager.input'
import { UpdateManagerInput } from './dtos/update-manager.input'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class ManagersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create(createManagerInput: CreateManagerInput) {
    const tenantId = this.tenantService.getTenantId()
    return this.prisma.manager.create({
      data: {
        ...createManagerInput,
        companyId: tenantId || undefined,
      },
    })
  }

  async findAll(args: FindManyManagerArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId) {
      return this.prisma.manager.findMany({
        ...args,
        where: {
          ...where,
          companyId: tenantId,
        },
      })
    }

    return this.prisma.manager.findMany(args)
  }

  async findOne(args: FindUniqueManagerArgs) {
    const tenantId = this.tenantService.getTenantId()

    const manager = await this.prisma.manager.findUnique({
      where: args.where,
    })

    if (!manager) return null

    if (tenantId && manager.companyId !== tenantId) {
      return null
    }

    return manager
  }

  async update(updateManagerInput: UpdateManagerInput) {
    const tenantId = this.tenantService.getTenantId()
    const { uid, ...data } = updateManagerInput

    const manager = await this.prisma.manager.findUnique({ where: { uid } })
    if (!manager) throw new Error('Manager not found')

    if (tenantId && manager.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.manager.update({
      where: { uid },
      data: data,
    })
  }

  async remove(args: FindUniqueManagerArgs) {
    const tenantId = this.tenantService.getTenantId()

    const manager = await this.prisma.manager.findUnique({ where: args.where })
    if (!manager) throw new Error('Manager not found')

    if (tenantId && manager.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.manager.delete(args)
  }
}
