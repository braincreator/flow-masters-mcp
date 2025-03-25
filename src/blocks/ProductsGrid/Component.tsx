'use client'

import RichText from '@/components/RichText'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { Grid } from '@/components/ui/grid'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  slug: string
  title: string
  description?: any // Changed to any to accept RichText content
  price: number
  thumbnail?: {
    url: string
  }
}

interface ProductsGridProps {
  products: Product[]
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
  layout = 'grid',
  labels,
  showPagination = true,
  productsPerPage = 12
}) => {
  const { addToCart } = useCart()

  return (
    <div className="space-y-6">
      <Grid 
        className="gap-6" 
        cols={layout === 'grid' ? 3 : 1}
      >
        {products.map(product => (
          <Card key={product.id} className="h-full flex flex-col">
            <Link href={`/products/${product.slug}`}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                {product.thumbnail?.url ? (
                  <Image
                    src={product.thumbnail.url}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
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
              <div className="text-muted-foreground line-clamp-2">
                <RichText content={product.description} />
              </div>
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
        ))}
      </Grid>

      {showPagination && labels && (
        <div className="mt-8">
          {/* Pagination component implementation */}
        </div>
      )}
    </div>
  )
}
