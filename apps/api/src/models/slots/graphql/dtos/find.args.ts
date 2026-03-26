import { ArgsType, Field, registerEnumType, PartialType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { SlotOrderByWithRelationInput } from './order-by.args'
import { SlotWhereInput, SlotWhereUniqueInput } from './where.args'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType(Prisma.SlotScalarFieldEnum, {
  name: 'SlotScalarFieldEnum',
})

@ArgsType()
class FindManySlotArgsStrict implements RestrictProperties<
  FindManySlotArgsStrict,
  Omit<Prisma.SlotFindManyArgs, 'include' | 'select'>
> {
  @Field(() => SlotWhereInput, { nullable: true })
  where: SlotWhereInput
  @Field(() => [SlotOrderByWithRelationInput], { nullable: true })
  orderBy: SlotOrderByWithRelationInput[]
  @Field(() => SlotWhereUniqueInput, { nullable: true })
  cursor: SlotWhereUniqueInput
  @Field({ nullable: true })
  take: number
  @Field({ nullable: true })
  skip: number
  @Field(() => [Prisma.SlotScalarFieldEnum])
  distinct: Prisma.SlotScalarFieldEnum[]
}

@ArgsType()
export class FindManySlotArgs extends PartialType(FindManySlotArgsStrict) {}

@ArgsType()
export class FindUniqueSlotArgs {
  @Field(() => SlotWhereUniqueInput)
  where: SlotWhereUniqueInput
}
