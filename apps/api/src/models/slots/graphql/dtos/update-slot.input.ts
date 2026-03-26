import { CreateSlotInput } from './create-slot.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateSlotInput extends PartialType(CreateSlotInput) {
  @Field(() => Number)
  id: number
}
