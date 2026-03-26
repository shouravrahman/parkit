import { CreateCompanyInput } from './create-company.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateCompanyInput extends PartialType(CreateCompanyInput) {
  @Field(() => Number)
  id: number
}
