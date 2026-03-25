import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql'
import { $Enums, Slot as SlotType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

registerEnumType($Enums.SlotType, {
  name: 'SlotType',
})

@ObjectType()
export class Slot implements RestrictProperties<Slot, SlotType> {
  @Field(() => Int)
  id: number
  @Field()
  createdAt: Date
  @Field()
  updatedAt: Date

  @Field({ nullable: true })
  displayName: string
  @Field(() => Float)
  pricePerHour: number
  @Field(() => Int, { nullable: true })
  length: number
  @Field(() => Int, { nullable: true })
  width: number
  @Field(() => Int, { nullable: true })
  height: number
  @Field(() => $Enums.SlotType)
  type: $Enums.SlotType
  @Field(() => Int)
  garageId: number
}

@ObjectType()
export class ReturnCount {
  @Field(() => Int)
  count: number
}
