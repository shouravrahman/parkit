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
import { NotificationsService } from 'src/models/notifications/graphql/notifications.service'
import { NotificationType } from '@prisma/client'

@Resolver(() => Verification)
export class VerificationsResolver {
  constructor(
    private readonly verificationsService: VerificationsService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) { }

  @AllowAuthenticated('admin')
  @Mutation(() => Verification)
  async createVerification(
    @Args('createVerificationInput') args: CreateVerificationInput,
    @GetUser() user: GetUserType,
  ) {
    const verification = await this.verificationsService.create(args, user.uid)

    // Notify garage manager
    try {
      const garage = await this.prisma.garage.findUnique({
        where: { id: args.garageId },
        include: { Company: { include: { Managers: true } } },
      })
      for (const manager of garage?.Company?.Managers ?? []) {
        await this.notificationsService.create({
          userId: manager.uid,
          title: 'Garage Verified',
          message: `${garage.displayName ?? 'Your garage'} has been verified.`,
          type: NotificationType.VERIFICATION_UPDATED,
        })
      }
    } catch { }

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
    // Notify manager of removal
    try {
      const garage = await this.prisma.garage.findUnique({
        where: { id: args.where.garageId },
        include: { Company: { include: { Managers: true } } },
      })
      for (const manager of garage?.Company?.Managers ?? []) {
        await this.notificationsService.create({
          userId: manager.uid,
          title: 'Verification Removed',
          message: `Verification for ${garage.displayName ?? 'your garage'} has been removed.`,
          type: NotificationType.VERIFICATION_UPDATED,
        })
      }
    } catch { }

    return this.verificationsService.remove(args)
  }
}
