import { Injectable, ForbiddenException } from '@nestjs/common'
import { FindManyAddressArgs, FindUniqueAddressArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateAddressInput } from './dtos/create-address.input'
import { UpdateAddressInput } from './dtos/update-address.input'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class AddressesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create(createAddressInput: CreateAddressInput) {
    const tenantId = this.tenantService.getTenantId()

    if (!createAddressInput.garageId) {
      throw new Error('garageId is required')
    }

    const garage = await this.prisma.garage.findUnique({
      where: { id: createAddressInput.garageId },
    })

    if (!garage) throw new Error('Garage not found')

    if (tenantId && garage.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.address.create({
      data: createAddressInput,
    })
  }

  async findAll(args: FindManyAddressArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId) {
      return this.prisma.address.findMany({
        ...args,
        where: {
          ...where,
          Garage: { is: { Company: { is: { id: tenantId } } } },
        },
      })
    }

    return this.prisma.address.findMany(args)
  }

  async findOne(args: FindUniqueAddressArgs) {
    const tenantId = this.tenantService.getTenantId()

    const address = await this.prisma.address.findUnique({
      where: args.where,
      include: { Garage: true },
    })

    if (!address) return null

    if (tenantId && address.Garage.companyId !== tenantId) {
      return null
    }

    return address
  }

  async update(updateAddressInput: UpdateAddressInput) {
    const tenantId = this.tenantService.getTenantId()
    const { id, ...data } = updateAddressInput

    const address = await this.prisma.address.findUnique({
      where: { id },
      include: { Garage: true },
    })
    if (!address) throw new Error('Address not found')

    if (tenantId && address.Garage.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.address.update({
      where: { id },
      data: data,
    })
  }

  async remove(args: FindUniqueAddressArgs) {
    const tenantId = this.tenantService.getTenantId()

    const address = await this.prisma.address.findUnique({
      where: args.where,
      include: { Garage: true },
    })
    if (!address) throw new Error('Address not found')

    if (tenantId && address.Garage.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.address.delete(args)
  }
}
