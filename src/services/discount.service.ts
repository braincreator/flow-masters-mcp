import { Payload } from 'payload'
import { PriceService } from './price.service'

interface DiscountValidationResult {
  isValid: boolean
  message?: string
  discount?: any
}

interface AppliedDiscount {
  originalPrice: number
  discountedPrice: number
  discountAmount: number
  discountCode: string
}

export class DiscountService {
  private static instance: DiscountService
  private priceService: PriceService

  private constructor() {
    this.priceService = PriceService.getInstance()
  }

  static getInstance(): DiscountService {
    if (!DiscountService.instance) {
      DiscountService.instance = new DiscountService()
    }
    return DiscountService.instance
  }

  async validateCode(
    code: string,
    userId?: string,
    cartTotal?: number,
  ): Promise<DiscountValidationResult> {
    const {
      docs: [discount],
    } = await payload.find({
      collection: 'discounts',
      where: {
        code: { equals: code },
        status: { equals: 'active' },
      },
    })

    if (!discount) {
      return { isValid: false, message: 'Invalid discount code' }
    }

    const now = new Date()
    if (now < new Date(discount.startDate) || now > new Date(discount.endDate)) {
      return { isValid: false, message: 'Discount code has expired' }
    }

    if (discount.maxUsage && discount.usageCount >= discount.maxUsage) {
      return { isValid: false, message: 'Discount code usage limit reached' }
    }

    if (userId && discount.maxUsagePerUser) {
      const userUsage = await this.getUserDiscountUsage(userId, code)
      if (userUsage >= discount.maxUsagePerUser) {
        return {
          isValid: false,
          message: 'You have reached the usage limit for this code',
        }
      }
    }

    if (cartTotal && discount.minOrderAmount && cartTotal < discount.minOrderAmount) {
      return {
        isValid: false,
        message: `Minimum order amount of ${discount.minOrderAmount} required`,
      }
    }

    return { isValid: true, discount }
  }

  async applyDiscount(
    price: number,
    discountCode: string,
    currency: string,
  ): Promise<AppliedDiscount> {
    const validation = await this.validateCode(discountCode)
    if (!validation.isValid) {
      throw new Error(validation.message)
    }

    const discount = validation.discount
    let discountAmount = 0

    switch (discount.type) {
      case 'percentage':
        discountAmount = (price * discount.value) / 100
        break
      case 'fixed':
        if (discount.currency !== currency) {
          // Convert fixed discount to target currency
          discountAmount = await this.priceService.convertPrice(
            discount.value,
            discount.currency,
            currency,
          )
        } else {
          discountAmount = discount.value
        }
        break
    }

    // Apply maximum discount if set
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount
    }

    return {
      originalPrice: price,
      discountedPrice: price - discountAmount,
      discountAmount,
      discountCode,
    }
  }

  private async getUserDiscountUsage(userId: string, code: string): Promise<number> {
    const { docs: orders } = await payload.find({
      collection: 'orders',
      where: {
        user: { equals: userId },
        discountCode: { equals: code },
      },
    })
    return orders.length
  }

  async recordDiscountUsage(code: string, userId: string): Promise<void> {
    const {
      docs: [discount],
    } = await payload.find({
      collection: 'discounts',
      where: { code: { equals: code } },
    })

    if (discount) {
      await payload.update({
        collection: 'discounts',
        id: discount.id,
        data: {
          usageCount: (discount.usageCount || 0) + 1,
        },
      })
    }
  }

  async isProductEligibleForDiscount(productId: string, discount: any): Promise<boolean> {
    if (!discount.applicableProducts?.length && !discount.applicableCategories?.length) {
      return !discount.excludedProducts?.includes(productId)
    }

    const product = await payload.findByID({
      collection: 'products',
      id: productId,
    })

    if (discount.excludedProducts?.includes(productId)) {
      return false
    }

    if (discount.applicableProducts?.includes(productId)) {
      return true
    }

    if (discount.applicableCategories?.length && product.categories) {
      return product.categories.some((cat: any) => discount.applicableCategories.includes(cat.id))
    }

    return false
  }
}
