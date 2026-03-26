import { ArgsType, Field, registerEnumType, PartialType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { CompanyOrderByWithRelationInput } from './order-by.args'
import { CompanyWhereInput, CompanyWhereUniqueInput } from './where.args'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType(Prisma.CompanyScalarFieldEnum, {
  name: 'CompanyScalarFieldEnum',
})

@ArgsType()
class FindManyCompanyArgsStrict implements RestrictProperties<
  FindManyCompanyArgsStrict,
  Omit<Prisma.CompanyFindManyArgs, 'include' | 'select'>
> {
  @Field(() => CompanyWhereInput, { nullable: true })
  where: CompanyWhereInput
  @Field(() => [CompanyOrderByWithRelationInput], { nullable: true })
  orderBy: CompanyOrderByWithRelationInput[]
  @Field(() => CompanyWhereUniqueInput, { nullable: true })
  cursor: CompanyWhereUniqueInput
  @Field({ nullable: true })
  take: number
  @Field({ nullable: true })
  skip: number
  @Field(() => [Prisma.CompanyScalarFieldEnum])
  distinct: Prisma.CompanyScalarFieldEnum[]
}

@ArgsType()
export class FindManyCompanyArgs extends PartialType(
  FindManyCompanyArgsStrict,
) {}

@ArgsType()
export class FindUniqueCompanyArgs {
  @Field(() => CompanyWhereUniqueInput)
  where: CompanyWhereUniqueInput
}
