'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/payload-types'

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart()
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]
    
    // Filter by category
    if (category !== 'all') {
      result = result.filter(product => product.category === category)
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
  }, [products, category, sortBy])

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="n8n">N8N Workflows</option>
            <option value="make">Make.com Workflows</option>
            <option value="tutorials">Tutorials</option>
            <option value="courses">Courses</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedProducts.length} products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProducts.map(product => (
          <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <Link href={`/products/${product.slug}`}>
              <div className="relative h-48">
                <Image
                  src={product.thumbnail.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/products/${product.slug}`}>
                <h3 className="text-xl font-semibold mb-2 hover:text-blue-600">
                  {product.title}
                </h3>
              </Link>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
