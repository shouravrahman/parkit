import { ObjectType, Field, Int } from '@nestjs/graphql'
import { SlotType } from '@prisma/client'

@ObjectType()
export class SlotAvailabilityUpdate {
    @Field(() => Int)
    garageId: number

    @Field(() => [SlotAvailabilityCount])
    availableSlots: SlotAvailabilityCount[]
}

@ObjectType()
export class SlotAvailabilityCount {
    @Field(() => SlotType)
    type: SlotType

    @Field(() => Int)
    count: number

    @Field(() => Number)
    pricePerHour: number
}
