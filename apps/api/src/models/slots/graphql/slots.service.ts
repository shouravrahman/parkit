import { Injectable } from '@nestjs/common'
import { FindManySlotArgs, FindUniqueSlotArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateSlotInput } from './dtos/create-slot.input'
import { UpdateSlotInput } from './dtos/update-slot.input'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class SlotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  create(createSlotInput: CreateSlotInput) {
    return this.prisma.slot.create({
      data: createSlotInput,
    })
  }

  async findAll(args: FindManySlotArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId && !args.where?.Garage) {
      const garages = await this.prisma.garage.findMany({
        where: { companyId: tenantId },
        select: { id: true },
      })
      const garageIds = garages.map((g) => g.id)

      return this.prisma.slot.findMany({
        ...args,
        where: {
          ...where,
          Garage: { is: { id: { in: garageIds } } },
        },
      })
    }

    return this.prisma.slot.findMany(args)
  }

  async findOne(args: FindUniqueSlotArgs) {
    const tenantId = this.tenantService.getTenantId()

    const slot = await this.prisma.slot.findUnique({
      where: args.where,
      include: { Garage: { include: { Company: true } } },
    })

    if (!slot) return null

    if (tenantId && slot.Garage.companyId !== tenantId) {
      return null
    }

    const { Garage, ...result } = slot as any
    return result
  }

  async update(updateSlotInput: UpdateSlotInput) {
    const tenantId = this.tenantService.getTenantId()

    const slot = await this.prisma.slot.findUnique({
      where: { id: updateSlotInput.id },
      include: { Garage: true },
    })

    if (!slot) throw new Error('Slot not found')

    if (tenantId && slot.garageId) {
      const garage = await this.prisma.garage.findUnique({
        where: { id: slot.garageId },
      })
      if (garage?.companyId !== tenantId) {
        throw new Error('Access denied')
      }
    }

    const { id, ...data } = updateSlotInput
    return this.prisma.slot.update({
      where: { id },
      data: data,
    })
  }

  async remove(args: FindUniqueSlotArgs) {
    const tenantId = this.tenantService.getTenantId()

    const slot = await this.prisma.slot.findUnique({
      where: args.where,
      include: { Garage: true },
    })

    if (!slot) throw new Error('Slot not found')

    if (tenantId && slot.garageId) {
      const garage = await this.prisma.garage.findUnique({
        where: { id: slot.garageId },
      })
      if (garage?.companyId !== tenantId) {
        throw new Error('Access denied')
      }
    }

    return this.prisma.slot.delete(args)
  }
}
