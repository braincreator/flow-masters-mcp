import { Payload } from 'payload'
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionPaymentHistory,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
} from '@/types/subscription'
import { PaymentService } from './payment.service'
import { NotificationService } from './notification.service'
import { BaseService } from './base.service'

export class SubscriptionService extends BaseService {
  private static instance: SubscriptionService | null = null
  private paymentService: PaymentService | null = null
  private notificationService: NotificationService | null = null

  private constructor(payload: Payload) {
    super(payload)

    // Инициализируем зависимые сервисы через ServiceRegistry
    const { ServiceRegistry } = require('./service.registry')
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    this.paymentService = serviceRegistry.getPaymentService()
    this.notificationService = serviceRegistry.getNotificationService()
  }

  public static getInstance(payload: Payload): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService(payload)
    }
    return SubscriptionService.instance
  }

  // Остальной код класса без изменений
}
