import { ArgsType, Field, registerEnumType, PartialType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { BookingTimelineOrderByWithRelationInput } from './order-by.args'
import {
  BookingTimelineWhereInput,
  BookingTimelineWhereUniqueInput,
} from './where.args'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType(Prisma.BookingTimelineScalarFieldEnum, {
  name: 'BookingTimelineScalarFieldEnum',
})

@ArgsType()
class FindManyBookingTimelineArgsStrict implements RestrictProperties<
  FindManyBookingTimelineArgsStrict,
  Omit<Prisma.BookingTimelineFindManyArgs, 'include' | 'select'>
> {
  @Field(() => BookingTimelineWhereInput, { nullable: true })
  where: BookingTimelineWhereInput
  @Field(() => [BookingTimelineOrderByWithRelationInput], { nullable: true })
  orderBy: BookingTimelineOrderByWithRelationInput[]
  @Field(() => BookingTimelineWhereUniqueInput, { nullable: true })
  cursor: BookingTimelineWhereUniqueInput
  @Field({ nullable: true })
  take: number
  @Field({ nullable: true })
  skip: number
  @Field(() => [Prisma.BookingTimelineScalarFieldEnum])
  distinct: Prisma.BookingTimelineScalarFieldEnum[]
}

@ArgsType()
export class FindManyBookingTimelineArgs extends PartialType(
  FindManyBookingTimelineArgsStrict,
) {}

@ArgsType()
export class FindUniqueBookingTimelineArgs {
  @Field(() => BookingTimelineWhereUniqueInput)
  where: BookingTimelineWhereUniqueInput
}
