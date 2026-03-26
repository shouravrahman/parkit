import { Field, InputType } from '@nestjs/graphql'
import { PickType } from '@nestjs/graphql'
import { Company } from '../entity/company.entity'

@InputType()
export class CreateCompanyInput extends PickType(
  Company,
  ['displayName', 'description'],
  InputType,
) {
  @Field()
  managerId: string
  @Field({ nullable: true })
  managerName?: string
}
