'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Author {
  id?: string
  name: string
  bio?: string
  slug?: string
  avatar?: {
    url: string
    alt?: string
  }
  socialLinks?: {
    platform: string
    url: string
  }[]
}

interface BlogAuthorBioProps {
  author: Author
}

export function BlogAuthorBio({ author }: BlogAuthorBioProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const currentLocale = segments.length > 1 ? segments[1] : 'en'

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {author.avatar?.url && (
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image
                src={author.avatar.url}
                alt={author.avatar.alt || author.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">{author.name}</h3>

          {author.bio && <p className="text-muted-foreground mb-4">{author.bio}</p>}

          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {author.slug && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${currentLocale}/authors/${author.slug}`}>View All Posts</Link>
              </Button>
            )}

            {author.socialLinks?.map((link, index) => (
              <Button key={index} variant="ghost" size="sm" asChild>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.platform}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
