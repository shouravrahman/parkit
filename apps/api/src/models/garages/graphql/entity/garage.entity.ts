import { Field, ObjectType } from '@nestjs/graphql'
import { Garage as GarageType, SlotType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class Garage implements RestrictProperties<Garage, GarageType> {
  @Field()
  id: number
  @Field()
  createdAt: Date
  @Field()
  updatedAt: Date
  @Field({ nullable: true })
  displayName: string
  @Field({ nullable: true })
  description: string
  @Field(() => [String], { nullable: true })
  images: string[]
  @Field()
  companyId: number
}

@ObjectType()
export class SlotTypeCount {
  @Field(() => SlotType)
  type: SlotType
  @Field()
  count: number
}
