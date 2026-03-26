import { CreateGarageInput } from './create-garage.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateGarageInput extends PartialType(CreateGarageInput) {
  @Field(() => Number)
  id: number
}
