import { ArgsType, Field, registerEnumType, PartialType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { ValetAssignmentOrderByWithRelationInput } from './order-by.args'
import {
  ValetAssignmentWhereInput,
  ValetAssignmentWhereUniqueInput,
} from './where.args'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType(Prisma.ValetAssignmentScalarFieldEnum, {
  name: 'ValetAssignmentScalarFieldEnum',
})

@ArgsType()
class FindManyValetAssignmentArgsStrict implements RestrictProperties<
  FindManyValetAssignmentArgsStrict,
  Omit<Prisma.ValetAssignmentFindManyArgs, 'include' | 'select'>
> {
  @Field(() => ValetAssignmentWhereInput, { nullable: true })
  where: ValetAssignmentWhereInput
  @Field(() => [ValetAssignmentOrderByWithRelationInput], { nullable: true })
  orderBy: ValetAssignmentOrderByWithRelationInput[]
  @Field(() => ValetAssignmentWhereUniqueInput, { nullable: true })
  cursor: ValetAssignmentWhereUniqueInput
  @Field({ nullable: true })
  take: number
  @Field({ nullable: true })
  skip: number
  @Field(() => [Prisma.ValetAssignmentScalarFieldEnum])
  distinct: Prisma.ValetAssignmentScalarFieldEnum[]
}

@ArgsType()
export class FindManyValetAssignmentArgs extends PartialType(
  FindManyValetAssignmentArgsStrict,
) {}

@ArgsType()
export class FindUniqueValetAssignmentArgs {
  @Field(() => ValetAssignmentWhereUniqueInput)
  where: ValetAssignmentWhereUniqueInput
}
