import { CreateBookingTimelineInput } from './create-booking-timeline.input'
import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
export class UpdateBookingTimelineInput extends PartialType(
  CreateBookingTimelineInput,
) {
  @Field(() => Number)
  id: number
}
