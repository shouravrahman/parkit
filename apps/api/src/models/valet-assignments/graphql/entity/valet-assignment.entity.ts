import { Field, ObjectType } from '@nestjs/graphql'
import { ValetAssignment as ValetAssignmentType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class ValetAssignment implements RestrictProperties<
  ValetAssignment,
  ValetAssignmentType
> {
  @Field()
  bookingId: number
  @Field()
  createdAt: Date
  @Field()
  updatedAt: Date
  @Field({ nullable: true })
  pickupLat: number
  @Field({ nullable: true })
  pickupLng: number
  @Field({ nullable: true })
  returnLat: number
  @Field({ nullable: true })
  returnLng: number
  @Field({ nullable: true })
  pickupValetId: string
  @Field({ nullable: true })
  returnValetId: string
  @Field()
  companyId: number
}
