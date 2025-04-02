'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Link, LinkProps } from '@/components/ui/link'
import { cn } from '@/utilities/ui'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/constants'

export interface CMSLinkType extends Omit<LinkProps, 'href'> {
  label?: string
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
  newTab?: boolean
}

export const CMSLink: React.FC<CMSLinkType> = ({
  variant = 'default',
  size = 'default',
  children,
  className,
  label,
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
  newTab,
  ...props
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
        path =
          reference.relationTo === 'pages'
            ? `/${reference.value.slug}`
            : `/${reference.relationTo}/${reference.value.slug}`
      } else {
        path =
          reference.relationTo === 'pages'
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

  const isActive = exactMatch ? pathname === href : pathname.startsWith(href)

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

  return (
    <Link
      href={href}
      variant={variant}
      size={size}
      className={cn(
        disabled && 'opacity-50 pointer-events-none',
        isActive && activeClassName,
        className,
      )}
      external={newTab || url?.startsWith('http')}
      onClick={onClick}
      {...props}
    >
      {content}
    </Link>
  )
}
