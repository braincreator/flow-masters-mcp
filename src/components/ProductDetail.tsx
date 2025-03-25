'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/payload-types'
import RichText from '@/components/RichText'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(product.thumbnail)

  return (
    <div className="grid md:grid-cols-2 gap-8 p-8">
      <div className="space-y-6">
        <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg">
          {selectedImage && selectedImage.url ? (
            <Image
              src={selectedImage.url}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        
        {product.gallery && product.gallery.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            <div
              className={`relative aspect-square cursor-pointer rounded-md overflow-hidden shadow-md ${
                selectedImage.id === product.thumbnail.id ? 'ring-2 ring-blue-500' : 'hover:opacity-80 transition-opacity'
              }`}
              onClick={() => setSelectedImage(product.thumbnail)}
            >
              {product.thumbnail && product.thumbnail.url && (
                <Image
                  src={product.thumbnail.url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            {product.gallery.map((item) => (
              <div
                key={item.image.id}
                className={`relative aspect-square cursor-pointer rounded-md overflow-hidden shadow-md ${
                  selectedImage.id === item.image.id ? 'ring-2 ring-blue-500' : 'hover:opacity-80 transition-opacity'
                }`}
                onClick={() => setSelectedImage(item.image)}
              >
                {item.image && (
                  <Image
                    src={item.image.url || ''}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{product.title}</h1>
        <div className="text-5xl font-bold text-blue-600 dark:text-blue-500">${product.price}</div>
        
        
        <div className="prose max-w-none dark:prose-invert">
          <RichText data={product.description} />
        </div>
        {product.features && product.features.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Features</h3>
            <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
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
            className="text-blue-500 hover:text-blue-600 block font-medium"
          >
            View Demo →
          </a>
        )}

        <button
          onClick={() => addToCart(product)}
          className="w-full bg-blue-600 text-white py-4 px-8 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}