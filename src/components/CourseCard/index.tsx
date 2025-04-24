'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CourseAccess } from '@/components/CourseAccess'

interface CourseCardProps {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: {
    url: string
    alt?: string
  }
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration?: string
  product?: {
    id: string
    pricing?: {
      finalPrice?: number
      compareAtPrice?: number
    }
  }
  className?: string
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  slug,
  excerpt,
  featuredImage,
  difficulty,
  estimatedDuration,
  product,
  className = '',
}) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  }

  const difficultyLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  }

  return (
    <div className={`course-card rounded-lg overflow-hidden shadow-md bg-white ${className}`}>
      <Link href={`/courses/${slug}`} className="block">
        <div className="relative h-48 w-full">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt || title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/courses/${slug}`} className="block">
            <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">{title}</h3>
          </Link>
          
          {difficulty && (
            <span className={`text-xs px-2 py-1 rounded ${difficultyColors[difficulty]}`}>
              {difficultyLabels[difficulty]}
            </span>
          )}
        </div>

        {excerpt && <p className="text-gray-600 text-sm mb-3">{excerpt}</p>}

        <div className="flex justify-between items-center mb-4">
          {estimatedDuration && (
            <span className="text-sm text-gray-500">
              <span className="mr-1">⏱️</span>
              {estimatedDuration}
            </span>
          )}

          {product?.pricing?.finalPrice !== undefined && (
            <div className="text-right">
              {product.pricing.compareAtPrice && product.pricing.compareAtPrice > product.pricing.finalPrice && (
                <span className="text-gray-400 line-through text-sm mr-2">
                  ${product.pricing.compareAtPrice.toFixed(2)}
                </span>
              )}
              <span className="font-bold text-lg">${product.pricing.finalPrice.toFixed(2)}</span>
            </div>
          )}
        </div>

        <CourseAccess 
          courseId={id} 
          productId={product?.id} 
          title={title} 
        />
      </div>
    </div>
  )
}
