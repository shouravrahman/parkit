import { CreateBookingInput } from './create-booking.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateBookingInput extends PartialType(CreateBookingInput) {
  @Field(() => Number)
  id: number
}
