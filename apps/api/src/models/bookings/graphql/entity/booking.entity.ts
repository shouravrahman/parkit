import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { $Enums, Booking as BookingType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType($Enums.BookingStatus, {
  name: 'BookingStatus',
})

@ObjectType()
export class Booking implements RestrictProperties<Booking, BookingType> {
  @Field()
  id: number
  @Field()
  createdAt: Date
  @Field()
  updatedAt: Date
  @Field({ nullable: true })
  pricePerHour: number
  @Field({ nullable: true })
  totalPrice: number
  @Field()
  startTime: Date
  @Field()
  endTime: Date
  @Field()
  vehicleNumber: string
  @Field({ nullable: true })
  phoneNumber: string
  @Field({ nullable: true })
  passcode: string
  @Field(() => $Enums.BookingStatus)
  status: $Enums.BookingStatus
  @Field()
  slotId: number
  @Field()
  customerId: string
  @Field({ nullable: true })
  companyId: number
}
