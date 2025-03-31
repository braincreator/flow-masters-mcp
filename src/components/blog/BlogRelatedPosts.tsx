'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Post {
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
  posts: Post[]
}

export function BlogRelatedPosts({ posts }: BlogRelatedPostsProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/${currentLocale}/blog/${post.slug}`}
          className="block transition-transform hover:scale-[1.02]"
        >
          <Card className="h-full overflow-hidden">
            {post.heroImage?.url && (
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={post.heroImage.url}
                  alt={post.heroImage.alt || post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <CardHeader className="p-4">
              <CardTitle className="line-clamp-2 text-lg">{post.title}</CardTitle>

              {post.categories && post.categories.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {post.categories.slice(0, 1).map((category) => (
                    <span key={category.id} className="text-xs text-primary font-medium">
                      {category.title}
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>

            {post.excerpt && (
              <CardContent className="p-4 pt-0">
                <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
              </CardContent>
            )}

            {post.publishedAt && (
              <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
              </CardFooter>
            )}
          </Card>
        </Link>
      ))}
    </div>
  )
}
