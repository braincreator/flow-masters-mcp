'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getTechIcon, type TechIcon as TechIconType } from '@/lib/tech-icons'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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
        'border border-white/30 transition-colors duration-200 group',
        // Simplified hover effects for mobile performance
        'hover:bg-white/30 hover:border-white/50',
        // Only apply scale on larger screens to reduce mobile choppiness
        'md:hover:shadow-xl md:hover:scale-105 md:transition-all md:duration-300',
        'shadow-lg',
        // Add mobile performance optimization class
        'tech-icon-container',
        'cursor-pointer' && onClick,
        className,
      )}
      title={showTooltip ? techIcon.name : undefined}
      onClick={onClick}
    >
      <div
        className={cn(
          iconSizeClasses[size],
          // Simplified transform for mobile
          'md:group-hover:scale-110 md:transition-transform md:duration-200',
        )}
      >
        {shouldUseImage ? (
          <>
            {!imageLoaded && (
              <div className="w-full h-full bg-white/20 rounded">
                {/* Simplified placeholder without animation for mobile performance */}
                <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/30 rounded" />
              </div>
            )}
            <Image
              src={imagePath}
              alt={techIcon.name}
              width={size === 'xl' ? 48 : size === 'lg' ? 38 : size === 'md' ? 29 : 19}
              height={size === 'xl' ? 48 : size === 'lg' ? 38 : size === 'md' ? 29 : 19}
              className={cn(
                'w-full h-full object-contain',
                // Simplified transition for mobile performance
                'transition-opacity duration-200',
                imageLoaded ? 'opacity-100' : 'opacity-0',
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                logWarn(`Failed to load tech icon: ${imagePath} for ${techIcon.name}`, e)
                setImageError(true)
              }}
              // Add priority for above-the-fold icons
              priority={false}
            />
          </>
        ) : techIcon.fallbackSvg ? (
          <TechIconSVG
            svgContent={techIcon.fallbackSvg}
            color={techIcon.color}
            name={techIcon.name}
            className="w-full h-full"
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
  mobileColumns?: number
  tabletColumns?: number
  onIconClick?: (slug: string) => void
}

export function TechIconsGrid({
  icons,
  size = 'md',
  className,
  columns = 10,
  mobileColumns = 4,
  tabletColumns = 6,
  onIconClick,
}: TechIconsGridProps) {
  // Создаем адаптивные классы колонок
  const gridCols = cn(
    `grid-cols-${mobileColumns}`,
    `sm:grid-cols-${Math.min(mobileColumns + 1, tabletColumns)}`,
    `md:grid-cols-${tabletColumns}`,
    `lg:grid-cols-${Math.min(tabletColumns + 2, columns)}`,
    `xl:grid-cols-${columns}`,
  )

  return (
    <div
      className={cn(
        'grid gap-2 sm:gap-3 md:gap-4 justify-center justify-items-center',
        gridCols,
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

/**
 * Safe SVG component that renders SVG content without dangerouslySetInnerHTML
 * Provides better mobile compatibility and error handling
 */
interface TechIconSVGProps {
  svgContent: string
  color?: string
  name: string
  className?: string
}

function TechIconSVG({ svgContent, color, name, className }: TechIconSVGProps) {
  const [svgError, setSvgError] = React.useState(false)

  // Parse SVG content safely
  const parseSVGContent = React.useCallback((content: string) => {
    try {
      // Handle simple SVG strings
      if (content.includes('<svg')) {
        // Extract viewBox and path data
        const viewBoxMatch = content.match(/viewBox="([^"]*)"/)
        const pathMatch = content.match(/<path[^>]*d="([^"]*)"[^>]*\/?>/)
        const fillMatch = content.match(/fill="([^"]*)"/)

        if (pathMatch) {
          return {
            viewBox: viewBoxMatch?.[1] || '0 0 24 24',
            path: pathMatch[1],
            fill: fillMatch?.[1] || color || 'currentColor'
          }
        }
      }

      // Handle simple div content (like AG-UI)
      if (content.includes('<div')) {
        return { isDiv: true, content }
      }

      return null
    } catch (error) {
      logWarn(`Failed to parse SVG for ${name}:`, error)
      logDebug(`SVG content that failed:`, svgContent.substring(0, 200) + '...')
      return null
    }
  }, [svgContent, color, name])

  const svgData = parseSVGContent(svgContent)

  if (svgError || !svgData) {
    return (
      <div className={cn(className, "flex items-center justify-center text-xs font-medium")}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  // Render div content (for text-based icons like AG-UI)
  if (svgData.isDiv) {
    return (
      <div
        className={cn(className, "flex items-center justify-center")}
        style={{ color }}
      >
        <div className="text-xs font-bold px-1 py-0.5 rounded border border-current/20 bg-current/10">
          {name.replace('-', '')}
        </div>
      </div>
    )
  }

  // Render SVG content
  return (
    <div className={cn(className, "flex items-center justify-center")} style={{ color }}>
      <svg
        viewBox={svgData.viewBox}
        className="w-full h-full"
        fill={svgData.fill}
        xmlns="http://www.w3.org/2000/svg"
        onError={() => setSvgError(true)}
      >
        <path d={svgData.path} />
      </svg>
    </div>
  )
}
