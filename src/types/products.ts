export interface ProductQueryParams {
  category?: string
  search?: string
  sort?: 'newest' | 'price-low' | 'price-high'
  page?: string
  locale?: string
  minPrice?: number
  maxPrice?: number
}