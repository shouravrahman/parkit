import { Injectable, ForbiddenException } from '@nestjs/common'
import { FindManyReviewArgs, FindUniqueReviewArgs } from './dtos/find.args'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { CreateReviewInput } from './dtos/create-review.input'
import { UpdateReviewInput } from './dtos/update-review.input'
import { TenantService } from 'src/common/tenant/tenant.service'

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async create(createReviewInput: CreateReviewInput) {
    const tenantId = this.tenantService.getTenantId()

    const garage = await this.prisma.garage.findUnique({
      where: { id: createReviewInput.garageId },
    })

    if (!garage) throw new Error('Garage not found')

    if (tenantId && garage.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.review.create({
      data: createReviewInput,
    })
  }

  async findAll(args: FindManyReviewArgs) {
    const tenantId = this.tenantService.getTenantId()
    const where = args.where || {}

    if (tenantId) {
      return this.prisma.review.findMany({
        ...args,
        where: {
          ...where,
          Garage: { is: { Company: { is: { id: tenantId } } } },
        },
      })
    }

    return this.prisma.review.findMany(args)
  }

  async findOne(args: FindUniqueReviewArgs) {
    const tenantId = this.tenantService.getTenantId()

    const review = await this.prisma.review.findUnique({
      where: args.where,
      include: { Garage: true },
    })

    if (!review) return null

    if (tenantId && review.Garage.companyId !== tenantId) {
      return null
    }

    return review
  }

  async update(updateReviewInput: UpdateReviewInput) {
    const tenantId = this.tenantService.getTenantId()
    const { id, ...data } = updateReviewInput

    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { Garage: true },
    })
    if (!review) throw new Error('Review not found')

    if (tenantId && review.Garage.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.review.update({
      where: { id },
      data: data,
    })
  }

  async remove(args: FindUniqueReviewArgs) {
    const tenantId = this.tenantService.getTenantId()

    const review = await this.prisma.review.findUnique({
      where: args.where,
      include: { Garage: true },
    })
    if (!review) throw new Error('Review not found')

    if (tenantId && review.Garage.companyId !== tenantId) {
      throw new ForbiddenException('Access denied')
    }

    return this.prisma.review.delete(args)
  }
}
