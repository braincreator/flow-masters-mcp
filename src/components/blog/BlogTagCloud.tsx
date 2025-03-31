'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface Tag {
  id: string
  title: string
  slug: string
}

interface BlogTagCloudProps {
  tags: Tag[]
}

export function BlogTagCloud({ tags }: BlogTagCloudProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="outline" className="hover:bg-muted transition-colors">
          <Link href={`/${currentLocale}/blog?tag=${tag.slug}`} className="block px-1">
            {tag.title}
          </Link>
        </Badge>
      ))}
    </div>
  )
}
