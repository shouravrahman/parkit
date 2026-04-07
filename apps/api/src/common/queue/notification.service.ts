import { Injectable } from '@nestjs/common'
import {
  NotificationQueueService,
  NotificationJobData,
} from './notification-queue.service'
import { NotificationType } from '@prisma/client'

export interface SendNotificationOptions {
  userId: string
  title: string
  message: string
  type: NotificationType
  metadata?: Record<string, any>
}

@Injectable()
export class NotificationService {
  constructor(private readonly notificationQueue: NotificationQueueService) {}

  async send(options: SendNotificationOptions) {
    await this.notificationQueue.enqueueNotification({
      userId: options.userId,
      title: options.title,
      message: options.message,
      type: options.type,
      metadata: options.metadata,
    })
  }

  async sendBookingConfirmed(
    bookingId: number,
    customerId: string,
    garageName: string,
  ) {
    await this.send({
      userId: customerId,
      title: 'Booking Confirmed',
      message: `Your booking at ${garageName} has been confirmed. Booking ID: ${bookingId}`,
      type: 'BOOKING_CONFIRMED',
      metadata: { bookingId },
    })
  }

  async sendBookingCancelled(
    bookingId: number,
    customerId: string,
    reason?: string,
  ) {
    await this.send({
      userId: customerId,
      title: 'Booking Cancelled',
      message: reason || `Your booking #${bookingId} has been cancelled.`,
      type: 'BOOKING_STATUS_UPDATED',
      metadata: { bookingId },
    })
  }

  async sendValetAssigned(
    bookingId: number,
    userId: string,
    valetName: string,
  ) {
    await this.send({
      userId,
      title: 'Valet Assigned',
      message: `A valet (${valetName}) has been assigned to your booking #${bookingId}.`,
      type: 'VALET_ASSIGNED',
      metadata: { bookingId },
    })
  }

  async sendBookingStatusUpdate(
    bookingId: number,
    userId: string,
    status: string,
    message: string,
  ) {
    await this.send({
      userId,
      title: 'Booking Status Update',
      message: `Booking #${bookingId}: ${message}`,
      type: 'BOOKING_STATUS_UPDATED',
      metadata: { bookingId, status },
    })
  }

  async sendNewBooking(
    bookingId: number,
    managerId: string,
    customerName: string,
    time: string,
  ) {
    await this.send({
      userId: managerId,
      title: 'New Booking',
      message: `New booking from ${customerName} at ${time}. Booking ID: ${bookingId}`,
      type: 'NEW_BOOKING',
      metadata: { bookingId },
    })
  }

  async sendToMultiple(
    userIds: string[],
    options: Omit<SendNotificationOptions, 'userId'>,
  ) {
    const notifications = userIds.map((userId) => ({
      ...options,
      userId,
    }))
    await this.notificationQueue.enqueueNotificationBulk(notifications)
  }
}
