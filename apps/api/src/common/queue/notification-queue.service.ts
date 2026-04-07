import { Inject, Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { NOTIFICATION_QUEUE, NOTIFICATION_QUEUE_NAME } from './queue.constants'
import { NotificationType } from '@prisma/client'

export interface NotificationJobData {
  userId: string
  title: string
  message: string
  type: NotificationType
  metadata?: Record<string, any>
}

@Injectable()
export class NotificationQueueService {
  constructor(
    @Inject(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async enqueueNotification(data: NotificationJobData) {
    await this.notificationQueue.add('send', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    })
  }

  async enqueueNotificationBulk(notifications: NotificationJobData[]) {
    const jobs = notifications.map((data) => ({
      name: 'send',
      data,
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    }))
    await this.notificationQueue.addBulk(jobs)
  }
}
