import { Payload } from 'payload'
import { LRUCache } from 'lru-cache'

interface PromotionRule {
  type: 'percentage' | 'fixed' | 'buy_x_get_y'
  value: number
  minPurchase?: number
  maxDiscount?: number
  productIds?: string[]
  categoryIds?: string[]
}

export class PromotionService {
  private payload: Payload
  private promoCache: LRUCache<string, any>

  constructor(payload: Payload) {
    this.payload = payload
    this.promoCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 5, // 5 minutes
    })
  }

  async createPromoCode(data: {
    code: string
    rule: PromotionRule
    startDate?: Date
    endDate?: Date
    usageLimit?: number
    userLimit?: number
  }): Promise<void> {
    await this.payload.create({
      collection: 'promotions',
      data: {
        ...data,
        status: 'active',
        usageCount: 0,
      },
    })
    
    this.promoCache.delete('active_promotions')
  }

  async validatePromoCode(code: string, userId: string, cart: any): Promise<{
    valid: boolean
    discount?: number
    message?: string
  }> {
    const promotion = await this.payload.find({
      collection: 'promotions',
      where: {
        code: { equals: code },
        status: { equals: 'active' },
      },
    }).then(res => res.docs[0])

    if (!promotion) {
      return { valid: false, message: 'Invalid promotion code' }
    }

    // Check dates
    const now = new Date()
    if (promotion.startDate && new Date(promotion.startDate) > now) {
      return { valid: false, message: 'Promotion not yet active' }
    }
    if (promotion.endDate && new Date(promotion.endDate) < now) {
      return { valid: false, message: 'Promotion has expired' }
    }

    // Check usage limits
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return { valid: false, message: 'Promotion usage limit reached' }
    }

    // Check user limit
    if (promotion.userLimit) {
      const userUsage = await this.payload.find({
        collection: 'orders',
        where: {
          user: { equals: userId },
          'promotion.code': { equals: code },
        },
      })

      if (userUsage.totalDocs >= promotion.userLimit) {
        return { valid: false, message: 'You have reached the usage limit for this promotion' }
      }
    }

    // Calculate discount
    const discount = await this.calculateDiscount(promotion.rule, cart)

    return {
      valid: true,
      discount,
    }
  }

  private async calculateDiscount(rule: PromotionRule, cart: any): Promise<number> {
    const cartTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    switch (rule.type) {
      case 'percentage':
        const percentageDiscount = cartTotal * (rule.value / 100)
        return rule.maxDiscount ? Math.min(percentageDiscount, rule.maxDiscount) : percentageDiscount

      case 'fixed':
        return Math.min(rule.value, cartTotal)

      case 'buy_x_get_y':
        // Implementation for buy X get Y free promotion
        return 0 // Placeholder

      default:
        return 0
    }
  }

  async applyPromotion(orderId: string, promoCode: string): Promise<void> {
    await this.payload.update({
      collection: 'promotions',
      where: {
        code: { equals: promoCode },
      },
      data: {
        usageCount: { increment: 1 },
      },
    })

    this.promoCache.delete('active_promotions')
  }
}