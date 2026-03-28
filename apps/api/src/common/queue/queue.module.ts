import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { QueueService } from './queue.service'
import { BookingWorkerService } from './worker.service'

export const BOOKING_QUEUE = 'BOOKING_QUEUE'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: BOOKING_QUEUE,
      useFactory: (config: ConfigService) => {
        const REDIS_URL = config.get<string>('REDIS_URL') || 'redis://127.0.0.1:6379'
        return new Queue('booking:postprocess', { connection: REDIS_URL } as any)
      },
      inject: [ConfigService],
    },
    QueueService,
    BookingWorkerService,
  ],
  exports: [QueueService],
})
export class QueueModule {}
