import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { PubSub } from 'graphql-subscriptions'
import { PUB_SUB } from 'src/common/pubsub/pubsub.module'
import { NotificationType } from '@prisma/client'

export const NOTIFICATION_ADDED = 'notificationAdded'

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string) {
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

  async findOne(id: number, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    })
    if (!notification) throw new NotFoundException('Notification not found')
    if (notification.userId !== userId)
      throw new ForbiddenException('Access denied')
    return notification
  }
}
