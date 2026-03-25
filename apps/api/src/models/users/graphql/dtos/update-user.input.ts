import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class UpdateUserInput {
  @Field()
  uid: string
  @Field({ nullable: true })
  name?: string
  @Field({ nullable: true })
  image?: string
}
