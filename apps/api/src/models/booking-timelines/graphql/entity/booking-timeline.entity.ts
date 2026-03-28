import { Field, ObjectType } from '@nestjs/graphql'
import { $Enums, BookingTimeline as BookingTimelineType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class BookingTimeline implements RestrictProperties<
  BookingTimeline,
  BookingTimelineType
> {
  @Field()
  id: number
  @Field()
  timestamp: Date
  @Field(() => $Enums.BookingStatus)
  status: $Enums.BookingStatus
  @Field()
  bookingId: number
  @Field({ nullable: true })
  valetId: string
  @Field({ nullable: true })
  managerId: string
  @Field({ nullable: true })
  companyId: number
}
