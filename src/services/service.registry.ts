import { Payload } from 'payload'
import { ProductService } from './product.service'
import { PriceService } from './price.service'
import { RecommendationService } from './recommendation.service'
import { IntegrationService } from './integration.service'
import { StorageService } from './storage.service'
import { NotificationService } from './notification.service'
import { EmailService } from './email.service'
import { TelegramService } from './telegram.service'
import { PaymentService } from './payment.service'
import { SubscriptionService } from './subscription.service'
import { OrderService } from './order.service'
import { CalendlyService } from './calendly.service'
import { ServiceService } from './service.service'
import { AutoAccountService } from './auto-account.service'
import { EnrollmentService } from './courses/enrollmentService'
import { LessonProgressService } from './courses/lessonProgressService'
import { AchievementService } from './achievement.service'
import { UserLevelService } from './user-level.service'
import { LeaderboardService } from './leaderboard.service'
import { RewardService } from './reward.service'
import { RewardDiscountService } from './reward-discount.service'

export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services: Map<string, any> = new Map()
  private payload: Payload

  private constructor(payload: Payload) {
    this.payload = payload
    this.initializeAllServices()
  }

  static getInstance(payload: Payload): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(payload)
    }
    return ServiceRegistry.instance
  }

  /**
   * Инициализируем все сервисы при создании ServiceRegistry
   */
  private initializeAllServices(): void {
    // Базовые сервисы
    this.getIntegrationService()
    this.getStorageService()

    // Телеграм и почта
    this.getTelegramService()
    this.getEmailService()

    // Уведомления
    this.getNotificationService()

    // Платежи
    this.getPaymentService()
    this.getSubscriptionService()

    // Бизнес-сервисы
    this.getProductService()
    this.getPriceService()
    this.getRecommendationService()
    this.getOrderService()
    this.getServiceService()
    this.getAutoAccountService()

    // Курсы и обучение
    this.getEnrollmentService()
    this.getLessonProgressService()
    this.getAchievementService()
    this.getUserLevelService()
    this.getLeaderboardService()
    this.getRewardService()
    this.getRewardDiscountService()
    this.getNotificationService()

    // Интеграции с внешними сервисами
    this.getCalendlyService()
  }

  getProductService(): ProductService {
    const key = 'product'
    if (!this.services.has(key)) {
      this.services.set(key, ProductService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getPriceService(): PriceService {
    const key = 'price'
    if (!this.services.has(key)) {
      this.services.set(key, PriceService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getRecommendationService(): RecommendationService {
    const key = 'recommendation'
    if (!this.services.has(key)) {
      this.services.set(key, RecommendationService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getIntegrationService(): IntegrationService {
    const key = 'integration'
    if (!this.services.has(key)) {
      this.services.set(key, IntegrationService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getStorageService(): StorageService {
    const key = 'storage'
    if (!this.services.has(key)) {
      this.services.set(key, StorageService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getNotificationService(): NotificationService {
    const key = 'notification'
    if (!this.services.has(key)) {
      this.services.set(key, NotificationService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getEmailService(): EmailService {
    const key = 'email'
    if (!this.services.has(key)) {
      this.services.set(key, EmailService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getTelegramService(): TelegramService {
    const key = 'telegram'
    if (!this.services.has(key)) {
      this.services.set(key, TelegramService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getPaymentService(): PaymentService {
    const key = 'payment'
    if (!this.services.has(key)) {
      this.services.set(key, PaymentService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getSubscriptionService(): SubscriptionService {
    const key = 'subscription'
    if (!this.services.has(key)) {
      this.services.set(key, SubscriptionService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getOrderService(): OrderService {
    const key = 'order'
    if (!this.services.has(key)) {
      this.services.set(key, OrderService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getCalendlyService(): CalendlyService {
    const key = 'calendly'
    if (!this.services.has(key)) {
      this.services.set(key, CalendlyService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getEnrollmentService(): EnrollmentService {
    const key = 'enrollment'
    if (!this.services.has(key)) {
      this.services.set(key, new EnrollmentService(this.payload))
    }
    return this.services.get(key)
  }

  getAchievementService(): AchievementService {
    const key = 'achievement'
    if (!this.services.has(key)) {
      this.services.set(key, AchievementService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getLessonProgressService(): LessonProgressService {
    const key = 'lessonProgress'
    if (!this.services.has(key)) {
      this.services.set(key, LessonProgressService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getUserLevelService(): UserLevelService {
    const key = 'userLevel'
    if (!this.services.has(key)) {
      this.services.set(key, UserLevelService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getLeaderboardService(): LeaderboardService {
    const key = 'leaderboard'
    if (!this.services.has(key)) {
      this.services.set(key, LeaderboardService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getRewardService(): RewardService {
    const key = 'reward'
    if (!this.services.has(key)) {
      this.services.set(key, RewardService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getRewardDiscountService(): RewardDiscountService {
    const key = 'rewardDiscount'
    if (!this.services.has(key)) {
      this.services.set(key, RewardDiscountService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getNotificationService(): any {
    const key = 'notification'
    if (!this.services.has(key)) {
      const NotificationService = require('./notification.service').NotificationService
      this.services.set(key, NotificationService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getServiceService(): ServiceService {
    const key = 'service'
    if (!this.services.has(key)) {
      this.services.set(key, new ServiceService(this.payload))
    }
    return this.services.get(key)
  }

  getAutoAccountService(): AutoAccountService {
    const key = 'autoAccount'
    if (!this.services.has(key)) {
      this.services.set(key, new AutoAccountService(this.payload))
    }
    return this.services.get(key)
  }
}
