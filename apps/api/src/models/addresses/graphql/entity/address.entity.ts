import { Field, ObjectType } from '@nestjs/graphql'
import { Address as AddressType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class Address implements RestrictProperties<Address, AddressType> {
  @Field()
  id: number
  @Field()
  createdAt: Date
  @Field()
  updatedAt: Date
  @Field()
  address: string
  @Field()
  lat: number
  @Field()
  lng: number
  @Field({ nullable: true })
  garageId: number
}
