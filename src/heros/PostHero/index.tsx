import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'
import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors = populatedAuthors && 
    populatedAuthors.length > 0 && 
    formatAuthors(populatedAuthors) !== ''

  return (
    <div className="relative -mt-[10.4rem] min-h-[80vh] flex items-end">
      {/* Hero Image */}
      <div className="absolute inset-0 w-full h-full">
        {heroImage && typeof heroImage !== 'string' && (
          <Media
            resource={heroImage}
            fill
            priority
            className="absolute inset-0"
            imgClassName="object-cover"
            sizes="100vw"
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 text-white pb-12">
        <div className="max-w-[48rem]">
          <div className="space-y-6">
            {categories?.length > 0 && (
              <div className="uppercase text-sm">
                {categories.map((category, index) => {
                  if (typeof category === 'object' && category !== null) {
                    const titleToUse = category.title || 'Untitled category'
                    return (
                      <React.Fragment key={index}>
                        {titleToUse}
                        {index < categories.length - 1 && ', '}
                      </React.Fragment>
                    )
                  }
                  return null
                })}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">{title}</h1>

            <div className="flex flex-col md:flex-row gap-6">
              {hasAuthors && (
                <div>
                  <p className="text-sm opacity-75">Author</p>
                  <p>{formatAuthors(populatedAuthors)}</p>
                </div>
              )}
              {publishedAt && (
                <div>
                  <p className="text-sm opacity-75">Date Published</p>
                  <time dateTime={publishedAt}>
                    {formatDateTime(publishedAt)}
                  </time>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
