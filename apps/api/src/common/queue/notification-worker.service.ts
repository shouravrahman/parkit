import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Worker } from 'bullmq'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { NOTIFICATION_QUEUE_NAME } from './queue.constants'
import { getRedisConnectionOptions } from './utils'
import { NotificationJobData } from './notification-queue.service'
import Redis from 'ioredis'
import { PubSub } from 'graphql-subscriptions'
import { PUB_SUB } from 'src/common/pubsub/pubsub.module'

@Injectable()
export class NotificationWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  private worker: Worker | null = null

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const REDIS_URL =
      this.config.get<string>('REDIS_URL') ||
      process.env.REDIS_URL ||
      'redis://127.0.0.1:6379'
    const connectionOptions = await getRedisConnectionOptions(REDIS_URL)

    this.worker = new Worker(
      NOTIFICATION_QUEUE_NAME,
      async (job) => {
        const data = job.data as NotificationJobData
        console.log('Processing notification job', job.id, data)

        try {
          const notification = await this.prisma.notification.create({
            data: {
              userId: data.userId,
              title: data.title,
              message: data.message,
              type: data.type,
            },
          })

          console.log('Notification created:', notification.id)

          return notification
        } catch (err) {
          console.error('Error creating notification:', err)
          throw err
        }
      },
      {
        connection: new Redis((connectionOptions as any).url, {
          maxRetriesPerRequest: null,
          tls: (connectionOptions as any).tls,
        }),
      },
    )

    this.worker.on('completed', (job) => {
      console.log('Notification job completed', job.id)
    })

    this.worker.on('failed', (job, err) => {
      console.error('Notification job failed', job?.id, err.message)
    })

    console.log('NotificationWorkerService started')
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close()
      this.worker = null
    }
  }
}
