import { Field, ObjectType } from '@nestjs/graphql'
import { Review as ReviewType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class Review implements RestrictProperties<Review, ReviewType> {
  @Field()
  id: number
  @Field()
  createdAt: Date
  @Field()
  updatedAt: Date
  @Field()
  rating: number
  @Field({ nullable: true })
  comment: string
  @Field()
  customerId: string
  @Field()
  garageId: number
}
