import React from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { GridContainer } from '@/components/GridContainer'
import { ArticleHeaderBlock } from '@/types/blocks'

export const ArticleHeaderBlock: React.FC<ArticleHeaderBlock> = ({
  title,
  subtitle,
  authorInfo,
  publishDate,
  readTime,
  featuredImage,
  categories = [],
  settings,
}) => {
  const formattedDate = publishDate ? format(new Date(publishDate), 'MMMM d, yyyy') : null

  return (
    <GridContainer settings={settings}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Title and subtitle */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">{title}</h1>

        {subtitle && (
          <h2 className="text-xl md:text-2xl font-medium text-muted-foreground mb-6">{subtitle}</h2>
        )}

        {/* Author and metadata */}
        <div className="flex items-center gap-4 mt-6 mb-8">
          {authorInfo?.avatar?.url && (
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={authorInfo.avatar.url}
                alt={authorInfo.name || ''}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex flex-col">
            {authorInfo?.name && <span className="font-medium">{authorInfo.name}</span>}

            <div className="flex items-center text-sm text-muted-foreground">
              {authorInfo?.role && <span className="mr-2">{authorInfo.role}</span>}

              {formattedDate && (
                <>
                  {authorInfo?.role && <span className="mx-2">•</span>}
                  <time dateTime={publishDate}>{formattedDate}</time>
                </>
              )}

              {readTime && (
                <>
                  <span className="mx-2">•</span>
                  <span>{readTime} min read</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Featured image */}
        {featuredImage?.url && (
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mt-4 mb-8">
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt || title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </div>
    </GridContainer>
  )
}
