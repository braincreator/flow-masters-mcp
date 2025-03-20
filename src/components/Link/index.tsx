'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'

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
    if (type === 'reference' && reference?.value) {
      if (typeof reference.value === 'object') {
        return `/${reference.relationTo}/${reference.value.slug}`
      }
      return `/${reference.relationTo}/${reference.value}`
    }
    return url || ''
  }, [type, reference, url])

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
