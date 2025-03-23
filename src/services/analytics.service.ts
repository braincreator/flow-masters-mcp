import { Payload } from 'payload'
import { LRUCache } from 'lru-cache'
import { Product, Order } from '../payload-types'

interface AnalyticsMetrics {
  views: number
  conversions: number
  revenue: number
}

export class AnalyticsService {
  private payload: Payload
  private metricsCache: LRUCache<string, AnalyticsMetrics>

  constructor(payload: Payload) {
    this.payload = payload
    this.metricsCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5 minutes
    })
  }

  async trackProductView(productId: string, userId?: string): Promise<void> {
    try {
      await this.payload.create({
        collection: 'analytics',
        data: {
          type: 'product_view',
          productId,
          userId,
          timestamp: new Date(),
        },
      })

      // Update cache
      const cacheKey = `product_metrics_${productId}`
      const currentMetrics = this.metricsCache.get(cacheKey) || { views: 0, conversions: 0, revenue: 0 }
      this.metricsCache.set(cacheKey, {
        ...currentMetrics,
        views: currentMetrics.views + 1,
      })
    } catch (error) {
      console.error('Failed to track product view:', error)
    }
  }

  async trackPurchase(orderId: string): Promise<void> {
    try {
      const order = await this.payload.findByID({
        collection: 'orders',
        id: orderId,
      })

      if (!order) return

      const products = order.products || []
      
      await Promise.all(products.map(async (product) => {
        const cacheKey = `product_metrics_${product.id}`
        const currentMetrics = this.metricsCache.get(cacheKey) || { views: 0, conversions: 0, revenue: 0 }
        
        this.metricsCache.set(cacheKey, {
          ...currentMetrics,
          conversions: currentMetrics.conversions + 1,
          revenue: currentMetrics.revenue + (product.price || 0),
        })

        await this.payload.create({
          collection: 'analytics',
          data: {
            type: 'purchase',
            productId: product.id,
            orderId,
            userId: order.user?.id,
            revenue: product.price,
            timestamp: new Date(),
          },
        })
      }))
    } catch (error) {
      console.error('Failed to track purchase:', error)
    }
  }

  async getProductMetrics(productId: string, period: 'day' | 'week' | 'month' = 'day'): Promise<AnalyticsMetrics> {
    const cacheKey = `product_metrics_${productId}_${period}`
    const cached = this.metricsCache.get(cacheKey)
    if (cached) return cached

    const startDate = new Date()
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 1)
    }

    const metrics = await this.payload.find({
      collection: 'analytics',
      where: {
        productId: { equals: productId },
        timestamp: { greater_than: startDate },
      },
    })

    const result = metrics.docs.reduce((acc, metric) => {
      switch (metric.type) {
        case 'product_view':
          acc.views++
          break
        case 'purchase':
          acc.conversions++
          acc.revenue += metric.revenue || 0
          break
      }
      return acc
    }, { views: 0, conversions: 0, revenue: 0 })

    this.metricsCache.set(cacheKey, result)
    return result
  }
}