'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/payload-types'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(product.thumbnail)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={selectedImage.url}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
        
        {product.gallery && product.gallery.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            <div
              className={`relative aspect-square cursor-pointer rounded-md overflow-hidden ${
                selectedImage.id === product.thumbnail.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedImage(product.thumbnail)}
            >
              <Image
                src={product.thumbnail.url}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            {product.gallery.map((item) => (
              <div
                key={item.image.id}
                className={`relative aspect-square cursor-pointer rounded-md overflow-hidden ${
                  selectedImage.id === item.image.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedImage(item.image)}
              >
                <Image
                  src={item.image.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <div className="text-4xl font-bold">${product.price}</div>
        
        <div className="prose max-w-none">
          {product.description}
        </div>

        {product.features && product.features.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Features</h3>
            <ul className="list-disc list-inside space-y-2">
              {product.features.map((feature, index) => (
                <li key={index}>{feature.feature}</li>
              ))}
            </ul>
          </div>
        )}

        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 block"
          >
            View Demo →
          </a>
        )}

        <button
          onClick={() => addToCart(product)}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}