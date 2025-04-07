import type { Payload } from 'payload'
import { BaseService } from './base.service'
import { Product, Media } from '../payload-types'
import {
  ProductCreateInput,
  ProductUpdateInput,
  ProductQueryOptions,
  ProductListResponse,
  ProductStats,
} from '../types/product.service'
import { CACHE_REVALIDATE_SECONDS, DEFAULT_LOCALE } from '../constants'
import { LRUCache } from 'lru-cache'
import { StorageService } from './storage.service'
import { IntegrationService } from './IntegrationService'
import { revalidateContent } from '../utilities/revalidation'

// Import unstable_cache from next/cache
import { unstable_cache } from 'next/cache'

export class ProductService extends BaseService {
  private static instance: ProductService | null = null
  private integrationService: IntegrationService
  private storageService: StorageService
  private cache: LRUCache<string, Product>
  private revalidationQueue: Set<string> = new Set()

  private constructor(payload: Payload) {
    super(payload)
    this.integrationService = IntegrationService.getInstance(payload)
    this.storageService = StorageService.getInstance(payload)
    this.cache = new LRUCache<string, Product>({
      max: 500,
      ttl: CACHE_REVALIDATE_SECONDS * 1000,
      updateAgeOnGet: true,
    })
  }

  public static getInstance(payload: Payload): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService(payload)
    }
    return ProductService.instance
  }

  private async triggerEvent(event: string, data: any) {
    try {
      // Get relevant integrations and trigger them
      const integration = await this.integrationService.getIntegrationByType('webhook')
      if (integration) {
        await this.integrationService.testIntegration(integration.id, {
          event,
          data,
        })
      }
    } catch (error) {
      console.error('Failed to trigger event:', error)
      // Don't throw here to prevent product creation from failing
    }
  }

  async create(input: ProductCreateInput, file?: Express.Multer.File): Promise<Product> {
    try {
      let fileDetails
      if (file) {
        fileDetails = await this.storageService.uploadProductFile(file)
      }

      const data = {
        ...input,
        fileDetails,
        status: input.status || 'draft',
        publishedAt: input.status === 'published' ? new Date() : null,
      }

      const result = await this.payload.create({
        collection: 'products',
        data,
      })

      const product = result as Product
      await this.triggerEvent('product.created', product)
      await revalidateContent({
        path: '/products',
        collection: 'products',
        slug: product.slug,
        payload: this.payload,
      })

      return product
    } catch (error) {
      console.error('Failed to create product:', error)
      throw error
    }
  }

  async update(
    id: string,
    input: ProductUpdateInput,
    file?: Express.Multer.File,
  ): Promise<Product> {
    try {
      const existingProduct = await this.findById(id)
      if (!existingProduct) {
        throw new Error(`Product with id ${id} not found`)
      }

      let fileDetails = existingProduct.fileDetails
      if (file) {
        if (existingProduct.fileDetails) {
          await this.storageService.deleteProductFile(existingProduct.fileDetails.filename)
        }
        fileDetails = await this.storageService.uploadProductFile(file)
      }

      const wasPublished = existingProduct.status === 'published'
      const isPublished = input.status === 'published'

      const data = {
        ...input,
        fileDetails,
        publishedAt: !wasPublished && isPublished ? new Date() : existingProduct.publishedAt,
      }

      const result = await this.payload.update({
        collection: 'products',
        id,
        data,
      })

      const product = result as Product
      productCache.del(id)
      await this.triggerEvent('product.updated', product)
      await revalidateContent({
        path: '/products',
        collection: 'products',
        slug: product.slug,
        payload: this.payload,
      })

      return product
    } catch (error) {
      console.error('Failed to update product:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const product = await this.findById(id)
      if (!product) {
        throw new Error(`Product with id ${id} not found`)
      }

      if (product.fileDetails) {
        await this.storageService.deleteProductFile(product.fileDetails.filename)
      }

      await this.payload.delete({
        collection: 'products',
        id,
      })

      productCache.del(id)
      await this.triggerEvent('product.deleted', product)
      await revalidateContent({
        path: '/products',
        collection: 'products',
        slug: product.slug,
        payload: this.payload,
      })
    } catch (error) {
      console.error('Failed to delete product:', error)
      throw error
    }
  }

  async getProduct(
    id: string,
    options: CacheOptions = { ttl: CACHE_REVALIDATE_SECONDS },
  ): Promise<Product | null> {
    try {
      const cached = this.cache.get(id)

      if (cached) {
        const age = this.cache.getRemainingTTL(id)
        if (age < 0 && options.staleWhileRevalidate) {
          this.revalidateAsync(id)
        }
        return cached
      }

      const product = await this.fetchProduct(id)
      if (product) {
        this.cache.set(id, product, { ttl: options.ttl * 1000 })
      }
      return product
    } catch (error) {
      console.error(`Cache error for product ${id}:`, error)
      return this.fetchProduct(id)
    }
  }

  private async fetchProduct(id: string): Promise<Product | null> {
    try {
      const product = await this.payload.findByID({
        collection: 'products',
        id,
      })
      return product
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error)
      throw new Error(
        `Product fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  private async revalidateAsync(id: string): Promise<void> {
    if (this.revalidationQueue.has(id)) return

    this.revalidationQueue.add(id)
    try {
      const product = await this.fetchProduct(id)
      if (product) {
        this.cache.set(id, product)
      } else {
        this.cache.delete(id)
      }
    } catch (error) {
      console.error(`Background revalidation failed for product ${id}:`, error)
    } finally {
      this.revalidationQueue.delete(id)
    }
  }

  async invalidateProduct(id: string): Promise<void> {
    this.cache.delete(id)
  }

  async warmCache(ids: string[]): Promise<void> {
    await Promise.allSettled(ids.map((id) => this.getProduct(id)))
  }

  async findBySlug(slug: string, locale = DEFAULT_LOCALE): Promise<Product | null> {
    try {
      const result = await this.payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        locale,
      })

      return (result.docs[0] as Product) || null
    } catch (error) {
      console.error('Failed to find product by slug:', error)
      return null
    }
  }

  async find(options: ProductQueryOptions = {}): Promise<ProductListResponse> {
    const { page = 1, limit = 10, where = {}, locale = DEFAULT_LOCALE } = options

    const cacheKey = `products-${JSON.stringify({ page, limit, where, locale })}`

    try {
      // Check client-side cache first
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return cached as ProductListResponse
      }

      // If not in client cache, fetch from server
      const result = await this.payload.find({
        collection: 'products',
        where,
        page,
        limit,
        locale,
      })

      const response: ProductListResponse = {
        items: result.docs as Product[],
        totalCount: result.totalDocs,
        totalPages: result.totalPages,
      }

      // Cache the result
      this.cache.set(cacheKey, response, { ttl: CACHE_REVALIDATE_SECONDS * 1000 })

      return response
    } catch (error) {
      console.error('Failed to find products:', error)
      throw error
    }
  }

  async getStats(): Promise<ProductStats> {
    const getCachedStats = unstable_cache(
      async () => {
        try {
          const [total, published] = await Promise.all([
            this.payload.find({ collection: 'products' }),
            this.payload.find({
              collection: 'products',
              where: { status: { equals: 'published' } },
            }),
          ])

          const totalProducts = total.totalDocs
          const publishedProducts = published.totalDocs
          const draftProducts = totalProducts - publishedProducts

          const averagePrice =
            published.docs.reduce((acc, doc: any) => acc + (doc.price || 0), 0) / publishedProducts

          return {
            totalProducts,
            publishedProducts,
            draftProducts,
            averagePrice,
          }
        } catch (error) {
          console.error('Failed to get product stats:', error)
          throw error
        }
      },
      ['product-stats'],
      { revalidate: CACHE_REVALIDATE_SECONDS },
    )

    return getCachedStats()
  }

  async updateThumbnail(id: string, mediaId: string): Promise<Product> {
    try {
      const media = (await this.payload.findByID({
        collection: 'media',
        id: mediaId,
      })) as Media

      if (!media) {
        throw new Error(`Media with id ${mediaId} not found`)
      }

      const result = await this.payload.update({
        collection: 'products',
        id,
        data: {
          thumbnail: media.id,
        },
      })

      productCache.del(id)
      await revalidateContent({
        path: '/products',
        collection: 'products',
        slug: result.slug,
        payload: this.payload,
      })

      return result as Product
    } catch (error) {
      console.error('Failed to update product thumbnail:', error)
      throw error
    }
  }

  async getProductWithCache(id: string): Promise<Product | null> {
    try {
      const cached = this.cache.get(id)
      if (cached) {
        return cached
      }

      const product = await this.fetchProduct(id)
      if (product) {
        this.cache.set(id, product)
      }
      return product
    } catch (error) {
      console.error(`Failed to get product ${id}:`, error)
      throw error
    }
  }

  async getPublishedProducts(options: ProductQueryOptions = {}): Promise<ProductListResponse> {
    const { page = 1, limit = 10, where = {}, locale = DEFAULT_LOCALE } = options

    return this.find({
      ...options,
      where: {
        ...where,
        status: {
          equals: 'published',
        },
      },
    })
  }

  async getRelatedProducts(product: Product, limit: number = 4): Promise<Product[]> {
    try {
      const result = await this.payload.find({
        collection: 'products',
        where: {
          category: {
            equals: product.category,
          },
          id: {
            not_equals: product.id,
          },
          status: {
            equals: 'published',
          },
        },
        limit,
      })

      return result.docs as Product[]
    } catch (error) {
      console.error('Failed to get related products:', error)
      return []
    }
  }
}
