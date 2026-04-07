import { Injectable } from '@nestjs/common'
import { FindManyGarageArgs, FindUniqueGarageArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateGarageInput } from './dtos/create-garage.input'
import { UpdateGarageInput } from './dtos/update-garage.input'
import { CreateSlotInputWithoutGarageId } from 'src/models/slots/graphql/dtos/create-slot.input'
import { Prisma, SlotType } from '@prisma/client'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class GaragesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create({
    Address,
    companyId,
    description,
    displayName,
    images,
    Slots,
  }: CreateGarageInput & { companyId: number }) {
    if (Slots.some((slot) => slot.count > 10)) {
      throw new Error('Slot count cannot be more than 20 for any slot type.')
    }
    return this.prisma.$transaction(async (tx) => {
      const createdGarage = await tx.garage.create({
        data: {
          Address: { create: Address },
          companyId,
          description,
          displayName,
          images,
        },
      })
      const slotsByType = this.groupSlotsByType(Slots, createdGarage.id)

      await tx.slot.createMany({
        data: slotsByType,
      })

      return createdGarage
    })
  }

  async findAll(args: FindManyGarageArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId) {
      return this.prisma.garage.findMany({
        ...args,
        where: {
          ...where,
          companyId: tenantId,
        },
      })
    }

    return this.prisma.garage.findMany(args)
  }

  async findOne(args: FindUniqueGarageArgs) {
    const tenantId = this.tenantService.getTenantId()

    const garage = await this.prisma.garage.findUnique({
      where: args.where,
    })

    if (!garage) return null

    if (tenantId && garage.companyId !== tenantId) {
      return null
    }

    return garage
  }

  async update(updateGarageInput: UpdateGarageInput) {
    const tenantId = this.tenantService.getTenantId()
    const { id, Address, Slots, ...data } = updateGarageInput

    const garage = await this.prisma.garage.findUnique({ where: { id } })
    if (!garage) throw new Error('Garage not found')

    if (tenantId && garage.companyId !== tenantId) {
      throw new Error('Access denied')
    }

    return this.prisma.garage.update({
      where: { id },
      data: data,
    })
  }

  async remove(args: FindUniqueGarageArgs) {
    const tenantId = this.tenantService.getTenantId()

    const garage = await this.prisma.garage.findUnique({ where: args.where })
    if (!garage) throw new Error('Garage not found')

    if (tenantId && garage.companyId !== tenantId) {
      throw new Error('Access denied')
    }

    return this.prisma.garage.delete(args)
  }

  groupSlotsByType(
    slots: CreateSlotInputWithoutGarageId[],
    garageId: number,
  ): Prisma.SlotCreateManyInput[] {
    const slotsByType = []
    const slotCounts = {
      CAR: 0,
      HEAVY: 0,
      BIKE: 0,
      BICYCLE: 0,
    }

    slots.forEach(({ count, ...slot }) => {
      for (let i = 0; i < count; i++) {
        slotsByType.push({
          ...slot,
          displayName: `${slot.type} ${slotCounts[slot.type]}`,
          garageId,
        })
        slotCounts[slot.type]++
      }
    })

    return slotsByType
  }
}
