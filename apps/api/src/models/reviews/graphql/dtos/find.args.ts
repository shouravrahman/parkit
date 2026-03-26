import { ArgsType, Field, registerEnumType, PartialType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { ReviewOrderByWithRelationInput } from './order-by.args'
import { ReviewWhereInput, ReviewWhereUniqueInput } from './where.args'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType(Prisma.ReviewScalarFieldEnum, {
  name: 'ReviewScalarFieldEnum',
})

@ArgsType()
class FindManyReviewArgsStrict implements RestrictProperties<
  FindManyReviewArgsStrict,
  Omit<Prisma.ReviewFindManyArgs, 'include' | 'select'>
> {
  @Field(() => ReviewWhereInput, { nullable: true })
  where: ReviewWhereInput
  @Field(() => [ReviewOrderByWithRelationInput], { nullable: true })
  orderBy: ReviewOrderByWithRelationInput[]
  @Field(() => ReviewWhereUniqueInput, { nullable: true })
  cursor: ReviewWhereUniqueInput
  @Field({ nullable: true })
  take: number
  @Field({ nullable: true })
  skip: number
  @Field(() => [Prisma.ReviewScalarFieldEnum])
  distinct: Prisma.ReviewScalarFieldEnum[]
}

@ArgsType()
export class FindManyReviewArgs extends PartialType(FindManyReviewArgsStrict) {}

@ArgsType()
export class FindUniqueReviewArgs {
  @Field(() => ReviewWhereUniqueInput)
  where: ReviewWhereUniqueInput
}
