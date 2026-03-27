import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { PubSub } from 'graphql-subscriptions'
import { PUB_SUB } from 'src/common/pubsub/pubsub.module'
import { NotificationType } from '@prisma/client'

export const NOTIFICATION_ADDED = 'notificationAdded'

@Injectable()
export class NotificationsService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub,
    ) { }

    async create({
        userId,
        title,
        message,
        type,
    }: {
        userId: string
        title: string
        message: string
        type: NotificationType
    }) {
        const notification = await this.prisma.notification.create({
            data: { userId, title, message, type },
        })
        await this.pubSub.publish(NOTIFICATION_ADDED, {
            [NOTIFICATION_ADDED]: notification,
        })
        return notification
    }

    findForUser(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
        })
    }

    unreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, read: false },
        })
    }

    markAsRead(id: number) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        })
    }

    markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        })
    }
}
