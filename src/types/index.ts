export interface Category {
  id: string
  title: Record<Locale, string>
  status: 'draft' | 'published'
}

export interface Product {
  id: string
  title: Record<Locale, string>
  description: Record<Locale, string>
  price: number
  category: Category
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}