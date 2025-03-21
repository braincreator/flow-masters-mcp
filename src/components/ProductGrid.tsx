'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'

export function ProductGrid({ products }) {
  const { addToCart } = useCart()
  const [category, setCategory] = useState('all')

  const filteredProducts = category === 'all' 
    ? products 
    : products.filter(product => product.category === category)

  return (
    <div>
      <div className="flex gap-4 mb-8">
        <button 
          className={`px-4 py-2 rounded ${category === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {['n8n', 'make', 'tutorials', 'courses'].map(cat => (
          <button
            key={cat}
            className={`px-4 py-2 rounded ${category === cat ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg">
            <Image
              src={product.thumbnail.url}
              alt={product.title}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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