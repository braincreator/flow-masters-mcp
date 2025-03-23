import { Payload } from 'payload'
import { BaseService } from './base.service'
import { Product } from '../payload-types'
import { LRUCache } from 'lru-cache'
import { CACHE_REVALIDATE_SECONDS } from '../constants'

interface ProductScore {
  productId: string
  score: number
}

export class RecommendationService extends BaseService {
  private recommendationCache: LRUCache<string, Product[]>

  constructor(payload: Payload) {
    super(payload)
    this.recommendationCache = new LRUCache({
      max: 100,
      ttl: CACHE_REVALIDATE_SECONDS * 1000
    })
  }

  private async calculateProductSimilarity(productId: string, otherProductId: string): Promise<number> {
    const [product, otherProduct] = await Promise.all([
      this.payload.findByID({ collection: 'products', id: productId }),
      this.payload.findByID({ collection: 'products', id: otherProductId }),
    ])

    if (!product || !otherProduct) return 0

    let score = 0

    // Category match
    if (product.category === otherProduct.category) {
      score += 0.3
    }

    // Price similarity (within 20% range)
    const priceDiff = Math.abs(product.price - otherProduct.price)
    const priceAvg = (product.price + otherProduct.price) / 2
    if (priceDiff / priceAvg <= 0.2) {
      score += 0.2
    }

    // Tags overlap
    const productTags = new Set(product.tags?.map(t => t.tag))
    const otherTags = new Set(otherProduct.tags?.map(t => t.tag))
    const commonTags = [...productTags].filter(tag => otherTags.has(tag))
    score += commonTags.length * 0.1

    return score
  }

  async getRecommendations(productId: string, limit: number = 4): Promise<Product[]> {
    const cacheKey = `recommendations_${productId}_${limit}`
    const cached = this.recommendationCache.get(cacheKey)
    if (cached) return cached

    const allProducts = await this.payload.find({
      collection: 'products',
      where: {
        id: { not_equals: productId },
        status: { equals: 'published' },
      },
    })

    const scores: ProductScore[] = await Promise.all(
      allProducts.docs.map(async (product) => ({
        productId: product.id,
        score: await this.calculateProductSimilarity(productId, product.id),
      }))
    )

    const recommendedIds = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(score => score.productId)

    const recommendations = await Promise.all(
      recommendedIds.map(id => 
        this.payload.findByID({
          collection: 'products',
          id,
        })
      )
    )

    this.recommendationCache.set(cacheKey, recommendations)
    return recommendations
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 4): Promise<Product[]> {
    // Get user's purchase history
    const orders = await this.payload.find({
      collection: 'orders',
      where: {
        user: { equals: userId },
      },
    })

    const purchasedProducts = orders.docs.flatMap(order => order.products || [])
    const purchasedCategories = new Set(purchasedProducts.map(p => p.category))

    // Get products in similar categories
    const recommendations = await this.payload.find({
      collection: 'products',
      where: {
        category: { in: Array.from(purchasedCategories) },
        id: { not_in: purchasedProducts.map(p => p.id) },
        status: { equals: 'published' },
      },
      limit,
    })

    return recommendations.docs
  }
}
