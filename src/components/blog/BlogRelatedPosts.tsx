'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatBlogDate } from '@/lib/blogHelpers'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  heroImage?: {
    url: string
    alt: string
  }
  categories?: {
    id: string
    title: string
    slug: string
  }[]
}

interface BlogRelatedPostsProps {
  posts: RelatedPost[]
}

export function BlogRelatedPosts({ posts }: BlogRelatedPostsProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden flex flex-col h-full border border-muted/60">
          {post.heroImage?.url && (
            <div className="aspect-[16/9] relative w-full overflow-hidden">
              <Link href={`/${currentLocale}/blog/${post.slug}`}>
                <Image
                  src={post.heroImage.url}
                  alt={post.heroImage.alt || post.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </Link>
            </div>
          )}

          <CardContent className="flex-grow p-5">
            {post.categories && post.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {post.categories.slice(0, 2).map((category) => (
                  <Badge key={category.id} variant="outline" className="font-normal">
                    <Link href={`/${currentLocale}/blog?category=${category.slug}`}>
                      {category.title}
                    </Link>
                  </Badge>
                ))}
              </div>
            )}

            <Link href={`/${currentLocale}/blog/${post.slug}`} className="block group">
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>

            {post.excerpt && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>
            )}
          </CardContent>

          <CardFooter className="border-t px-5 py-3">
            {post.publishedAt && (
              <time className="text-xs text-muted-foreground">
                {formatBlogDate(post.publishedAt, currentLocale)}
              </time>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
