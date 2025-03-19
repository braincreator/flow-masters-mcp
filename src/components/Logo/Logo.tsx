import clsx from 'clsx'
import React from 'react'
import type { Media } from '@/payload-types'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  logo?: Media | null
  size?: 'thumbnail' | 'small' | 'medium'
}

export const Logo = (props: Props) => {
  const { 
    loading: loadingFromProps, 
    priority: priorityFromProps, 
    className, 
    logo,
    size = 'thumbnail'
  } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  const defaultLogoUrl = 'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg'
  
  // Safely access the sizes array
  let logoUrl = defaultLogoUrl
  if (logo && typeof logo === 'object' && Array.isArray(logo.sizes)) {
    const sizedImage = logo.sizes.find(s => s.name === size)
    logoUrl = sizedImage?.url || logo.url || defaultLogoUrl
  }

  return (
    <img
      alt={logo?.alt || "Logo"}
      width={193}
      height={34}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('max-w-[9.375rem] w-full h-[34px]', className)}
      src={logoUrl}
    />
  )
}
