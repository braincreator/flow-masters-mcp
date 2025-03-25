'use client'

import { useState, useMemo } from 'react'
import { useCart } from '@/hooks/useCart'
import { ProductType } from '@/types'

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart()
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]
    
    // Filter by category
    if (category !== 'all') {
      result = result.filter(product => product.category === category)
    }

    // Filter by product type
    if (typeFilter !== 'all') {
      result = result.filter(product => product.productType === typeFilter)
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return result
  }, [products, category, sortBy, typeFilter])

  return (
    <div className="product-grid">
      <div className="filters">
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value as ProductType | 'all')}
        >
          <option value="all">All Types</option>
          <option value="digital">Digital</option>
          <option value="subscription">Subscription</option>
          <option value="service">Service</option>
          <option value="access">Access</option>
        </select>
        {/* Other filters */}
      </div>
      <div className="grid">
        {filteredAndSortedProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={() => addToCart(product)} 
          />
        ))}
      </div>
    </div>
  )
}
