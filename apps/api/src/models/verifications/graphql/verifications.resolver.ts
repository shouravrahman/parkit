import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { VerificationsService } from './verifications.service'
import { Verification } from './entity/verification.entity'
import {
  FindManyVerificationArgs,
  FindUniqueVerificationArgs,
} from './dtos/find.args'
import { CreateVerificationInput } from './dtos/create-verification.input'
import { UpdateVerificationInput } from './dtos/update-verification.input'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { GetUserType } from 'src/common/types'
import { NotificationService } from 'src/common/queue/notification.service'

@Resolver(() => Verification)
export class VerificationsResolver {
  constructor(
    private readonly verificationsService: VerificationsService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @AllowAuthenticated('admin')
  @Mutation(() => Verification)
  async createVerification(
    @Args('createVerificationInput') args: CreateVerificationInput,
    @GetUser() user: GetUserType,
  ) {
    const verification = await this.verificationsService.create(args, user.uid)

    const garage = await this.prisma.garage.findUnique({
      where: { id: args.garageId },
      include: { Company: { include: { Managers: true } } },
    })
    for (const manager of garage?.Company?.Managers ?? []) {
      await this.notificationService.send({
        userId: manager.uid,
        title: 'Garage Verified',
        message: `${garage.displayName ?? 'Your garage'} has been verified.`,
        type: 'VERIFICATION_UPDATED' as any,
        metadata: { garageId: args.garageId },
      })
    }

    return verification
  }

  @Query(() => [Verification], { name: 'verifications' })
  findAll(@Args() args: FindManyVerificationArgs) {
    return this.verificationsService.findAll(args)
  }

  @Query(() => Verification, { name: 'verification' })
  findOne(@Args() args: FindUniqueVerificationArgs) {
    return this.verificationsService.findOne(args)
  }

  @AllowAuthenticated('admin')
  @Mutation(() => Verification)
  async updateVerification(
    @Args('updateVerificationInput') args: UpdateVerificationInput,
  ) {
    return this.verificationsService.update(args)
  }

  @AllowAuthenticated('admin')
  @Mutation(() => Verification)
  async removeVerification(
    @Args() args: FindUniqueVerificationArgs,
    @GetUser() user: GetUserType,
  ) {
    const garage = await this.prisma.garage.findUnique({
      where: { id: args.where.garageId },
      include: { Company: { include: { Managers: true } } },
    })
    for (const manager of garage?.Company?.Managers ?? []) {
      await this.notificationService.send({
        userId: manager.uid,
        title: 'Garage Verification Removed',
        message: `Verification for ${garage.displayName ?? 'your garage'} has been removed.`,
        type: 'VERIFICATION_UPDATED' as any,
        metadata: { garageId: args.where.garageId },
      })
    }

    return this.verificationsService.remove(args)
  }
}
