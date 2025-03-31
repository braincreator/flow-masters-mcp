import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface Author {
  id: string
  name: string
  slug: string
  image?: string
  role?: string
  bio?: string
  social?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
}

export interface AuthorCardProps {
  author: Author
  className?: string
  variant?: 'compact' | 'default' | 'expanded'
  showSocial?: boolean
  showBio?: boolean
}

export function AuthorCard({
  author,
  className,
  variant = 'default',
  showSocial = true,
  showBio = true,
}: AuthorCardProps) {
  if (!author) return null

  // Determine which content to show based on variant
  const isCompact = variant === 'compact'
  const isExpanded = variant === 'expanded'

  // Only show bio if showBio is true and we're not in compact mode
  const displayBio = showBio && !isCompact && author.bio

  // Only show social if showSocial is true and we have social links
  const hasSocial = author.social && Object.values(author.social).some(Boolean)
  const displaySocial = showSocial && hasSocial

  // Generate initials for avatar fallback
  const initials = author.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'flex',
        isCompact ? 'items-center gap-2' : 'gap-4',
        isExpanded ? 'flex-col items-center text-center' : '',
        className,
      )}
    >
      {/* Author Avatar */}
      <Link
        href={`/blog/author/${author.slug}`}
        className={cn('shrink-0', isExpanded ? 'w-20 h-20' : isCompact ? 'w-8 h-8' : 'w-12 h-12')}
      >
        <Avatar
          className={cn('border', isExpanded ? 'w-20 h-20' : isCompact ? 'w-8 h-8' : 'w-12 h-12')}
        >
          <AvatarImage src={author.image} alt={author.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Link>

      <div
        className={cn(
          'flex min-w-0',
          isExpanded ? 'flex-col items-center' : 'flex-col',
          isCompact ? 'justify-center' : '',
        )}
      >
        {/* Author Name & Role */}
        <div className={isExpanded ? 'text-center' : ''}>
          <Link href={`/blog/author/${author.slug}`} className="font-medium hover:underline">
            {author.name}
          </Link>

          {author.role && !isCompact && (
            <p className="text-sm text-muted-foreground">{author.role}</p>
          )}
        </div>

        {/* Bio */}
        {displayBio && (
          <p
            className={cn(
              'mt-2 text-sm text-muted-foreground line-clamp-3',
              isExpanded ? 'text-center' : '',
            )}
          >
            {author.bio}
          </p>
        )}

        {/* Social Links */}
        {displaySocial && (
          <div className={cn('flex gap-2 mt-2', isExpanded ? 'justify-center' : '')}>
            {author.social?.twitter && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a
                  href={`https://twitter.com/${author.social.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on Twitter`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
                  </svg>
                </a>
              </Button>
            )}

            {author.social?.linkedin && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on LinkedIn`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </Button>
            )}

            {author.social?.github && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a
                  href={`https://github.com/${author.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name} on GitHub`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              </Button>
            )}

            {author.social?.website && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a
                  href={author.social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${author.name}'s website`}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
