import { Inject, Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { BOOKING_QUEUE } from './queue.module'

@Injectable()
export class QueueService {
  constructor(@Inject(BOOKING_QUEUE) private readonly bookingQueue: Queue) {}

  async enqueueBookingPostProcess(bookingId: number) {
    await this.bookingQueue.add('assign', { bookingId }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 } })
  }
}

export default QueueService
