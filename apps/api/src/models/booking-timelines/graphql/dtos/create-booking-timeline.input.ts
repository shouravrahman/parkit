import { InputType, OmitType, PickType, Field, Int } from '@nestjs/graphql'
import { BookingTimeline } from '../entity/booking-timeline.entity'

@InputType()
export class CreateBookingTimelineInput extends PickType(
  BookingTimeline,
  ['bookingId', 'status'],
  InputType,
) {
  @Field(() => Int, { nullable: true })
  companyId?: number

  @Field({ nullable: true })
  valetId?: string

  @Field({ nullable: true })
  managerId?: string
}
