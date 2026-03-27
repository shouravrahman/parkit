import {
    Resolver,
    Query,
    Mutation,
    Args,
    Subscription,
    Int,
} from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { PUB_SUB } from 'src/common/pubsub/pubsub.module'
import { NotificationsService, NOTIFICATION_ADDED } from './notifications.service'
import { Notification } from './entity/notification.entity'
import { AllowAuthenticated, GetUser } from 'src/common/auth/auth.decorator'
import { GetUserType } from 'src/common/types'

@Resolver(() => Notification)
export class NotificationsResolver {
    constructor(
        private readonly notificationsService: NotificationsService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub,
    ) { }

    @AllowAuthenticated()
    @Query(() => [Notification])
    myNotifications(@GetUser() user: GetUserType) {
        return this.notificationsService.findForUser(user.uid)
    }

    @AllowAuthenticated()
    @Query(() => Int)
    myUnreadNotificationsCount(@GetUser() user: GetUserType) {
        return this.notificationsService.unreadCount(user.uid)
    }

    @AllowAuthenticated()
    @Mutation(() => Notification)
    markNotificationAsRead(
        @Args('id', { type: () => Int }) id: number,
    ) {
        return this.notificationsService.markAsRead(id)
    }

    @AllowAuthenticated()
    @Mutation(() => Boolean)
    async markAllNotificationsAsRead(@GetUser() user: GetUserType) {
        await this.notificationsService.markAllAsRead(user.uid)
        return true
    }

    @Subscription(() => Notification, {
        filter: (payload, _, context) => {
            const userId = context?.req?.user?.uid ?? context?.user?.uid
            return payload.notificationAdded.userId === userId
        },
    })
    notificationAdded() {
        return this.pubSub.asyncIterableIterator(NOTIFICATION_ADDED)
    }
}
