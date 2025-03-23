import { Product } from './product'

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type CollectionHandlers = {
  [K in 'products']: {
    create: (data: FormData) => Promise<Product>
    update: (id: string, data: FormData) => Promise<Product>
    delete: (id: string) => Promise<void>
  }
}

export type SupportedCollections = keyof CollectionHandlers