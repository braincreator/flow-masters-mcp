'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/constants'

export interface CMSLinkType {
  appearance?: 'default' | 'primary' | 'secondary' | 'ghost' | 'inline'
  size?: 'sm' | 'default' | 'lg'
  children?: React.ReactNode
  className?: string
  label?: string
  newTab?: boolean
  reference?: {
    value: string | { slug: string }
    relationTo: string
  }
  type?: 'reference' | 'custom'
  url?: string
  icon?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  activeClassName?: string
  exactMatch?: boolean
  prefetch?: boolean
  onClick?: () => void
}

const linkStyles = {
  base: "inline-flex items-center transition-colors duration-200",
  sizes: {
    sm: "text-sm md:text-base",
    default: "text-base md:text-lg",
    lg: "text-lg md:text-xl"
  },
  appearance: {
    default: "text-foreground hover:text-primary",
    primary: "text-primary hover:text-primary/80",
    secondary: "text-secondary hover:text-secondary/80",
    ghost: "text-muted-foreground hover:text-foreground",
    inline: "text-primary underline-offset-4 hover:underline"
  }
}

export const CMSLink: React.FC<CMSLinkType> = ({
  appearance = 'default',
  size = 'default',
  children,
  className,
  label,
  newTab,
  reference,
  type,
  url,
  icon,
  loading,
  disabled,
  activeClassName,
  exactMatch = false,
  prefetch = true,
  onClick,
}) => {
  const pathname = usePathname()
  
  const href = React.useMemo(() => {
    // Extract current locale from pathname
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentLocale = SUPPORTED_LOCALES.includes(pathSegments[0] as any) 
      ? pathSegments[0] 
      : DEFAULT_LOCALE

    if (type === 'reference' && reference?.value) {
      let path
      if (typeof reference.value === 'object') {
        path = reference.relationTo === 'pages'
          ? `/${reference.value.slug}`
          : `/${reference.relationTo}/${reference.value.slug}`
      } else {
        path = reference.relationTo === 'pages'
          ? `/${reference.value}`
          : `/${reference.relationTo}/${reference.value}`
      }

      // Special handling for posts collection - no locale prefix
      if (reference.relationTo === 'posts') {
        return path
      }

      // Add locale prefix for pages and other collections
      return `/${currentLocale}${path}`
    }

    // For custom URLs
    if (url) {
      // If it's an external URL or starts with a special character, return as is
      if (url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:')) {
        return url
      }
      // For internal URLs, ensure locale prefix
      return url.startsWith('/') ? `/${currentLocale}${url}` : `/${currentLocale}/${url}`
    }

    return ''
  }, [type, reference, url, pathname])

  const isActive = exactMatch 
    ? pathname === href
    : pathname.startsWith(href)

  const linkClassName = cn(
    linkStyles.base,
    linkStyles.sizes[size],
    linkStyles.appearance[appearance],
    disabled && 'opacity-50 pointer-events-none',
    isActive && activeClassName,
    className
  )

  const content = (
    <>
      {icon && <span className="mr-2">{icon}</span>}
      {children || label}
      {loading && (
        <span className="ml-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        </span>
      )}
    </>
  )

  if (newTab) {
    return (
      <a
        href={href}
        className={linkClassName}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className={linkClassName}
      prefetch={prefetch}
      onClick={onClick}
    >
      {content}
    </Link>
  )
}
