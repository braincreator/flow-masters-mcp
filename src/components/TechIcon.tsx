'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getTechIcon, type TechIcon as TechIconType } from '@/lib/tech-icons'

interface TechIconProps {
  slug: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showTooltip?: boolean
  theme?: 'light' | 'dark' | 'auto'
  onClick?: () => void
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
}

const iconSizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
}

export const TechIcon = React.memo(function TechIcon({
  slug,
  size = 'md',
  className,
  showTooltip = true,
  theme = 'auto',
  onClick,
}: TechIconProps) {
  const [imageError, setImageError] = React.useState(false)
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [isDark, setIsDark] = React.useState(false)

  const techIcon = getTechIcon(slug)

  // Определяем тему
  React.useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDark(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      setIsDark(theme === 'dark')
    }
  }, [theme])

  // Сброс состояния ошибки при изменении иконки
  React.useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
  }, [slug, isDark])

  if (!techIcon) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          'bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center',
          className,
        )}
        title={`Unknown tech: ${slug}`}
      >
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {slug.slice(0, 2).toUpperCase()}
        </span>
      </div>
    )
  }

  const getImagePath = () => {
    if (isDark && techIcon.darkMode?.localPath) {
      return techIcon.darkMode.localPath
    }
    return techIcon.localPath
  }

  const imagePath = getImagePath()
  const shouldUseImage = imagePath && !imageError

  return (
    <div
      className={cn(
        sizeClasses[size],
        'bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center',
        'border border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300 group',
        'shadow-lg hover:shadow-xl hover:scale-105',
        'cursor-pointer' && onClick,
        className,
      )}
      title={showTooltip ? techIcon.name : undefined}
      onClick={onClick}
    >
      <div
        className={cn(
          iconSizeClasses[size],
          'group-hover:scale-110 transition-transform duration-200',
        )}
      >
        {shouldUseImage ? (
          <>
            {!imageLoaded && <div className="w-full h-full bg-white/20 animate-pulse rounded" />}
            <Image
              src={imagePath}
              alt={techIcon.name}
              width={size === 'xl' ? 48 : size === 'lg' ? 38 : size === 'md' ? 29 : 19}
              height={size === 'xl' ? 48 : size === 'lg' ? 38 : size === 'md' ? 29 : 19}
              className={cn(
                'w-full h-full object-contain transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0',
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.warn(`Failed to load tech icon: ${imagePath}`)
                setImageError(true)
              }}
            />
          </>
        ) : techIcon.fallbackSvg ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: techIcon.color }}
            dangerouslySetInnerHTML={{ __html: techIcon.fallbackSvg }}
          />
        ) : (
          <div className="w-full h-full bg-white/30 rounded flex items-center justify-center text-white/60 text-xs font-medium">
            {techIcon.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
})

// Компонент для отображения списка технологий
interface TechIconsGridProps {
  icons: string[]
  size?: TechIconProps['size']
  className?: string
  columns?: number
  onIconClick?: (slug: string) => void
}

export function TechIconsGrid({
  icons,
  size = 'md',
  className,
  columns = 10,
  onIconClick,
}: TechIconsGridProps) {
  return (
    <div
      className={cn(
        'grid gap-3 md:gap-4',
        `grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-${columns}`,
        className,
      )}
    >
      {icons.map((slug) => (
        <TechIcon
          key={slug}
          slug={slug}
          size={size}
          onClick={onIconClick ? () => onIconClick(slug) : undefined}
        />
      ))}
    </div>
  )
}
