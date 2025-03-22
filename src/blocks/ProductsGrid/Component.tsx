'use client'

import React, { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { Pagination } from '@/components/Pagination'
import { Grid, GridItem } from '@/components/ui/grid'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProductsGridProps {
  products: any[]
  productsPerPage?: number
  showPagination?: boolean
  layout?: 'grid' | 'list'
  labels?: {
    prev: string
    next: string
    page: string
    of: string
  }
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  productsPerPage = 12,
  showPagination = true,
  layout = 'grid',
  labels = {
    prev: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of'
  }
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
    <div className="space-y-6">
      <Grid cols={layout === 'list' ? 1 : 3} gap="lg">
        {currentProducts.map(product => (
          <GridItem key={product.id}>
            <Card className="h-full flex flex-col">
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                  <Image
                    src={product.thumbnail.url}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>
              
              <CardHeader className="flex-none">
                <Link 
                  href={`/products/${product.slug}`}
                  className="hover:underline"
                >
                  <h3 className="text-xl font-semibold line-clamp-2">
                    {product.title}
                  </h3>
                </Link>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between items-center pt-4">
                <span className="text-2xl font-bold">
                  ${product.price}
                </span>
                <Button
                  onClick={() => addToCart(product)}
                  variant="default"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          </GridItem>
        ))}
      </Grid>

      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          labels={labels}
        />
      )}
    </div>
  )
}
