import { Injectable, ForbiddenException } from '@nestjs/common'
import {
  FindManyValetAssignmentArgs,
  FindUniqueValetAssignmentArgs,
} from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateValetAssignmentInput } from './dtos/create-valet-assignment.input'
import { UpdateValetAssignmentInput } from './dtos/update-valet-assignment.input'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class ValetAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create(createValetAssignmentInput: CreateValetAssignmentInput) {
    const tenantId = this.tenantService.getTenantId()
    return this.prisma.valetAssignment.create({
      data: {
        ...createValetAssignmentInput,
        companyId:
          createValetAssignmentInput.companyId || tenantId || undefined,
      },
    })
  }

  async findAll(args: FindManyValetAssignmentArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId) {
      return this.prisma.valetAssignment.findMany({
        ...args,
        where: {
          ...where,
          companyId: tenantId,
        },
      })
    }

    return this.prisma.valetAssignment.findMany(args)
  }

  async findOne(args: FindUniqueValetAssignmentArgs) {
    const tenantId = this.tenantService.getTenantId()

    const assignment = await this.prisma.valetAssignment.findUnique({
      where: args.where,
      include: {
        Booking: { include: { Slot: { include: { Garage: true } } } },
      },
    })

    if (!assignment) return null

    if (tenantId && assignment.companyId !== tenantId) {
      return null
    }

    return assignment
  }

  async update(updateValetAssignmentInput: UpdateValetAssignmentInput) {
    const tenantId = this.tenantService.getTenantId()
    const { bookingId, ...data } = updateValetAssignmentInput

    const assignment = await this.prisma.valetAssignment.findUnique({
      where: { bookingId },
    })
    if (!assignment) throw new Error('Assignment not found')

    if (tenantId && assignment.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.valetAssignment.update({
      where: { bookingId },
      data: data,
    })
  }

  async remove(args: FindUniqueValetAssignmentArgs) {
    const tenantId = this.tenantService.getTenantId()

    const assignment = await this.prisma.valetAssignment.findUnique({
      where: args.where,
    })
    if (!assignment) throw new Error('Assignment not found')

    if (tenantId && assignment.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.valetAssignment.delete(args)
  }
}
