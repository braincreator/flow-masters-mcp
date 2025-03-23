import type { Product, Media } from '../payload-types'

export type ProductCreateInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
export type ProductUpdateInput = Partial<ProductCreateInput>

export interface ProductQueryOptions {
  page?: number
  limit?: number
  where?: Record<string, any>
  locale?: 'en' | 'ru'
}

export interface ProductListResponse {
  items: Product[]
  totalCount: number
  totalPages: number
}

export interface ProductFileDetails {
  filename: string
  mimeType: string
  filesize: number
  url: string
}

export interface ProductStats {
  totalProducts: number
  publishedProducts: number
  draftProducts: number
  averagePrice: number
}

export type ProductEventType = 
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'product.published'
  | 'product.unpublished'
