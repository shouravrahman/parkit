import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { NotificationType } from '@prisma/client'

registerEnumType(NotificationType, { name: 'NotificationType' })

@ObjectType()
export class Notification {
    @Field(() => Int)
    id: number

    @Field()
    createdAt: Date

    @Field()
    read: boolean

    @Field()
    title: string

    @Field()
    message: string

    @Field(() => NotificationType)
    type: NotificationType

    @Field()
    userId: string
}
