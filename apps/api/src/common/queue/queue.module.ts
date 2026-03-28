import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { QueueService } from './queue.service'
import { BookingWorkerService } from './worker.service'
import { BOOKING_QUEUE, BOOKING_QUEUE_NAME } from './queue.constants'
import { getRedisConnectionOptions } from './utils'
import Redis from 'ioredis'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: BOOKING_QUEUE,
      useFactory: async (config: ConfigService) => {
        const REDIS_URL = config.get<string>('REDIS_URL') || process.env.REDIS_URL || 'redis://127.0.0.1:6379'
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
    QueueService,
    BookingWorkerService,
  ],
  exports: [QueueService],
})
export class QueueModule {}
