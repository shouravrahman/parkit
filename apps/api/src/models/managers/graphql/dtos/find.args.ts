import { ArgsType, Field, registerEnumType, PartialType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { ManagerOrderByWithRelationInput } from './order-by.args'
import { ManagerWhereInput, ManagerWhereUniqueInput } from './where.args'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType(Prisma.ManagerScalarFieldEnum, {
  name: 'ManagerScalarFieldEnum',
})

@ArgsType()
class FindManyManagerArgsStrict implements RestrictProperties<
  FindManyManagerArgsStrict,
  Omit<Prisma.ManagerFindManyArgs, 'include' | 'select'>
> {
  @Field(() => ManagerWhereInput, { nullable: true })
  where: ManagerWhereInput
  @Field(() => [ManagerOrderByWithRelationInput], { nullable: true })
  orderBy: ManagerOrderByWithRelationInput[]
  @Field(() => ManagerWhereUniqueInput, { nullable: true })
  cursor: ManagerWhereUniqueInput
  @Field({ nullable: true })
  take: number
  @Field({ nullable: true })
  skip: number
  @Field(() => [Prisma.ManagerScalarFieldEnum])
  distinct: Prisma.ManagerScalarFieldEnum[]
}

@ArgsType()
export class FindManyManagerArgs extends PartialType(
  FindManyManagerArgsStrict,
) {}

@ArgsType()
export class FindUniqueManagerArgs {
  @Field(() => ManagerWhereUniqueInput)
  where: ManagerWhereUniqueInput
}
