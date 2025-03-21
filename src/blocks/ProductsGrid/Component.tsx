'use client'

import React, { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { Pagination } from '@/components/Pagination'

interface ProductsGridProps {
  products: any[]
  productsPerPage?: number
  showPagination?: boolean
  layout?: 'grid' | 'list'
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  productsPerPage = 12,
  showPagination = true,
  layout = 'grid',
}) => {
  const { addToCart } = useCart()
  const searchParams = useSearchParams()
  
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]
    
    // Apply search filter
    const search = searchParams.get('search')
    if (search) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply category filter
    const category = searchParams.get('category')
    if (category && category !== 'all') {
      result = result.filter(product => product.category === category)
    }

    // Apply sorting
    const sort = searchParams.get('sort')
    switch (sort) {
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
  }, [products, searchParams])

  const currentPage = Number(searchParams.get('page')) || 1
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  return (
    <div className="container mx-auto px-4">
      <div className={layout === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "flex flex-col gap-6"
      }>
        {currentProducts.map(product => (
          <div key={product.id} 
            className={layout === 'grid'
              ? "border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              : "flex border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            }
          >
            <Link href={`/products/${product.slug}`}>
              <div className={layout === 'grid' 
                ? "relative h-48"
                : "relative h-48 w-48"
              }>
                <Image
                  src={product.thumbnail.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="p-4 flex-1">
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="mt-8">
          <Pagination page={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  )
}