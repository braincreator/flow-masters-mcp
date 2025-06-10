import clsx from 'clsx'
import React from 'react'
import type { Media } from '@/payload-types'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  size?: 'thumbnail' | 'small' | 'medium' | 'large'
  logo?: string | Media | null
  showText?: boolean
}

export const Logo = (props: Props) => {
  const {
    loading: loadingFromProps,
    priority: priorityFromProps,
    className,
    size = 'small',
    logo,
    showText = true,
  } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  const defaultLogoUrl =
    'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg'

  // Determine the logo URL to use
  let logoUrl = defaultLogoUrl
  let logoAlt = 'Flow Masters'

  if (logo) {
    if (typeof logo === 'string') {
      logoUrl = logo
    } else if (logo && typeof logo === 'object' && 'url' in logo) {
      logoUrl = logo.url || defaultLogoUrl
      logoAlt = logo.alt || 'Flow Masters'
    }
  }

  // Size configurations
  const sizeConfig = {
    thumbnail: {
      container: 'h-8',
      image: 'h-6 w-auto',
      text: 'text-lg font-bold',
      gap: 'gap-2',
    },
    small: {
      container: 'h-10',
      image: 'h-8 w-auto',
      text: 'text-xl font-bold',
      gap: 'gap-3',
    },
    medium: {
      container: 'h-12',
      image: 'h-10 w-auto',
      text: 'text-2xl font-bold',
      gap: 'gap-3',
    },
    large: {
      container: 'h-16',
      image: 'h-12 w-auto',
      text: 'text-3xl font-bold',
      gap: 'gap-4',
    },
  }

  const config = sizeConfig[size]

  return (
    <div
      className={clsx(
        'flex items-center transition-all duration-300 hover:opacity-90',
        config.container,
        config.gap,
        className,
      )}
    >
      <img
        alt={logoAlt}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx(
          'object-contain transition-transform duration-300 hover:scale-105',
          config.image,
        )}
        src={logoUrl}
      />
      {showText && (
        <span
          className={clsx(
            // Gradient with good contrast in both themes
            'bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent',
            // Fallback for better contrast in dark theme
            'dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400',
            'font-sans font-extrabold tracking-tight transition-all duration-300',
            // Hover effects with theme-aware colors
            'hover:from-accent hover:via-primary hover:to-secondary',
            'dark:hover:from-purple-300 dark:hover:via-blue-300 dark:hover:to-cyan-300',
            // Add subtle text shadow for better visibility
            'drop-shadow-sm',
            config.text,
          )}
        >
          Flow Masters
        </span>
      )}
    </div>
  )
}
