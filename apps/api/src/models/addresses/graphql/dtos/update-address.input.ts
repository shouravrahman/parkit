import { CreateAddressInput } from './create-address.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateAddressInput extends PartialType(CreateAddressInput) {
  @Field(() => Number)
  id: number
}
