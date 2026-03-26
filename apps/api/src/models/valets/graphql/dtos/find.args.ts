import { ArgsType, Field, registerEnumType, PartialType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { ValetOrderByWithRelationInput } from './order-by.args'
import { ValetWhereInput, ValetWhereUniqueInput } from './where.args'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType(Prisma.ValetScalarFieldEnum, {
  name: 'ValetScalarFieldEnum',
})

@ArgsType()
class FindManyValetArgsStrict implements RestrictProperties<
  FindManyValetArgsStrict,
  Omit<Prisma.ValetFindManyArgs, 'include' | 'select'>
> {
  @Field(() => ValetWhereInput, { nullable: true })
  where: ValetWhereInput
  @Field(() => [ValetOrderByWithRelationInput], { nullable: true })
  orderBy: ValetOrderByWithRelationInput[]
  @Field(() => ValetWhereUniqueInput, { nullable: true })
  cursor: ValetWhereUniqueInput
  @Field({ nullable: true })
  take: number
  @Field({ nullable: true })
  skip: number
  @Field(() => [Prisma.ValetScalarFieldEnum])
  distinct: Prisma.ValetScalarFieldEnum[]
}

@ArgsType()
export class FindManyValetArgs extends PartialType(FindManyValetArgsStrict) {}

@ArgsType()
export class FindUniqueValetArgs {
  @Field(() => ValetWhereUniqueInput)
  where: ValetWhereUniqueInput
}
