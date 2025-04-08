import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { type Product } from '@/payload-types'
import { formatPrice } from '@/utils/formatPrice'

interface ProductCardProps {
  product: Product
  layout?: 'grid' | 'list'
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { title, description, price, images } = product
  const firstImage = Array.isArray(images) && images[0]

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group flex ${
        layout === 'grid' ? 'flex-col' : 'flex-row gap-8'
      } overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md`}
    >
      <div
        className={`relative ${layout === 'grid' ? 'aspect-square w-full' : 'aspect-square w-48'}`}
      >
        {firstImage && typeof firstImage !== 'string' && (
          <Image
            src={firstImage.url}
            alt={title}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <div
        className={`flex flex-col ${layout === 'grid' ? 'gap-2 p-4' : 'justify-between gap-4 py-4 pr-4'}`}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {layout === 'list' && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{description}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          {price && <div className="text-lg font-medium">{formatPrice(price)}</div>}
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}
