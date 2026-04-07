import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { FindManyValetArgs, FindUniqueValetArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateValetInput } from './dtos/create-valet.input'
import { UpdateValetInput } from './dtos/update-valet.input'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class ValetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create(createValetInput: CreateValetInput) {
    const tenantId = this.tenantService.getTenantId()
    if (!tenantId) {
      throw new ForbiddenException('Company context required')
    }
    return this.prisma.valet.create({
      data: { ...createValetInput, companyId: tenantId },
    })
  }

  async findAll(args: FindManyValetArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId) {
      return this.prisma.valet.findMany({
        ...args,
        where: {
          ...where,
          companyId: tenantId,
        },
      })
    }

    return this.prisma.valet.findMany(args)
  }

  async findOne(args: FindUniqueValetArgs) {
    const tenantId = this.tenantService.getTenantId()

    const valet = await this.prisma.valet.findUnique({
      where: args.where,
    })

    if (!valet) return null

    if (tenantId && valet.companyId !== tenantId) {
      return null
    }

    return valet
  }

  async update(updateValetInput: UpdateValetInput) {
    const tenantId = this.tenantService.getTenantId()
    const { uid, ...data } = updateValetInput

    const valet = await this.prisma.valet.findUnique({ where: { uid } })
    if (!valet) throw new Error('Valet not found')

    if (tenantId && valet.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.valet.update({
      where: { uid },
      data: data,
    })
  }

  async remove(args: FindUniqueValetArgs) {
    const tenantId = this.tenantService.getTenantId()

    const valet = await this.prisma.valet.findUnique({ where: args.where })
    if (!valet) throw new Error('Valet not found')

    if (tenantId && valet.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.valet.delete(args)
  }

  async validValet(uid: string) {
    const tenantId = this.tenantService.getTenantId()
    const valet = await this.prisma.valet.findUnique({
      where: { uid },
    })
    if (!valet) {
      throw new BadRequestException('You are not a valet.')
    }
    if (tenantId && valet.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }
    return valet
  }
}
