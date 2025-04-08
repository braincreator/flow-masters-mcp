import { type Product } from '@/payload-types'

export interface ProductsListProps {
  heading?: string
  subheading?: string
  enableFiltering?: boolean
  products?: Product[]
  limit?: number
  layout?: 'grid' | 'list'
}

export interface SortOption {
  label: string
  value: string
}

export interface FilterLabels {
  categories: string
  sort: string
  search: string
  searchPlaceholder: string
  allCategories: string
  productTypes: string
  priceRange: string
  layout: string
}

export interface PaginationLabels {
  prev: string
  next: string
  page: string
  of: string
}
