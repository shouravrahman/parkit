import { Field, ObjectType } from '@nestjs/graphql'
import { Valet as ValetType } from '@prisma/client'
import { RestrictProperties } from 'src/common/dtos/common.input'

@ObjectType()
export class Valet implements RestrictProperties<Valet, ValetType> {
  @Field()
  uid: string
  @Field()
  createdAt: Date
  @Field()
  updatedAt: Date
  @Field()
  displayName: string
  @Field({ nullable: true })
  image: string
  @Field()
  licenceID: string
  @Field({ nullable: true })
  companyId: number
}
