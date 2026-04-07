import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { QueueService } from './queue.service'
import { NotificationQueueService } from './notification-queue.service'
import { NotificationService } from './notification.service'
import { BookingWorkerService } from './worker.service'
import { NotificationWorkerService } from './notification-worker.service'
import {
  BOOKING_QUEUE,
  BOOKING_QUEUE_NAME,
  NOTIFICATION_QUEUE,
  NOTIFICATION_QUEUE_NAME,
} from './queue.constants'
import { getRedisConnectionOptions } from './utils'
import Redis from 'ioredis'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: BOOKING_QUEUE,
      useFactory: async (config: ConfigService) => {
        const REDIS_URL =
          config.get<string>('REDIS_URL') ||
          process.env.REDIS_URL ||
          'redis://127.0.0.1:6379'
        const connectionOptions = await getRedisConnectionOptions(REDIS_URL)

        return new Queue(BOOKING_QUEUE_NAME, {
          connection: new Redis((connectionOptions as any).url, {
            maxRetriesPerRequest: null,
            tls: (connectionOptions as any).tls,
          }),
        })
      },
      inject: [ConfigService],
    },
    {
      provide: NOTIFICATION_QUEUE,
      useFactory: async (config: ConfigService) => {
        const REDIS_URL =
          config.get<string>('REDIS_URL') ||
          process.env.REDIS_URL ||
          'redis://127.0.0.1:6379'
        const connectionOptions = await getRedisConnectionOptions(REDIS_URL)

        return new Queue(NOTIFICATION_QUEUE_NAME, {
          connection: new Redis((connectionOptions as any).url, {
            maxRetriesPerRequest: null,
            tls: (connectionOptions as any).tls,
          }),
        })
      },
      inject: [ConfigService],
    },
    QueueService,
    NotificationQueueService,
    NotificationService,
    BookingWorkerService,
    NotificationWorkerService,
  ],
  exports: [QueueService, NotificationService],
})
export class QueueModule {}
