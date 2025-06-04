'use client'

import React from 'react'
import { TechIcon, type TechIconProps } from './TechIcon'
import { cn } from '@/lib/utils'

interface TechGroup {
  title: string
  description?: string
  icons: string[]
}

interface TechIconsGroupedProps {
  groups: TechGroup[]
  size?: TechIconProps['size']
  className?: string
  showGroupTitles?: boolean
  iconsPerRow?: number
  onIconClick?: (slug: string) => void
}

export function TechIconsGrouped({
  groups,
  size = 'md',
  className,
  showGroupTitles = false,
  iconsPerRow = 10,
  onIconClick,
}: TechIconsGroupedProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {showGroupTitles && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white/90 mb-1">{group.title}</h3>
              {group.description && <p className="text-sm text-white/60">{group.description}</p>}
            </div>
          )}

          <div
            className={cn(
              'grid gap-3 md:gap-4 justify-center justify-items-center',
              `grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-${iconsPerRow}`,
            )}
          >
            {group.icons.map((slug) => (
              <TechIcon
                key={slug}
                slug={slug}
                size={size}
                onClick={onIconClick ? () => onIconClick(slug) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Предопределенные группы технологий
export const techGroups: TechGroup[] = [
  {
    title: 'AI модели и сервисы',
    description: 'Современные языковые модели и AI платформы',
    icons: ['openai', 'gemini', 'claude', 'deepseek'],
  },
  {
    title: 'AI инструменты и фреймворки',
    description: 'Инструменты для разработки AI приложений',
    icons: ['pydanticai', 'langchain', 'flowise', 'n8n', 'mcp', 'a2a'],
  },
  {
    title: 'Языки программирования',
    description: 'Основные языки для разработки',
    icons: ['typescript', 'python'],
  },
  {
    title: 'Фреймворки и библиотеки',
    description: 'Frontend и мобильные фреймворки',
    icons: ['react', 'nextjs', 'flutter', 'agui'],
  },
  {
    title: 'Платформы и среды выполнения',
    description: 'Среды выполнения и платформы коммуникации',
    icons: ['nodejs', 'telegram', 'whatsapp'],
  },
  {
    title: 'Инструменты разработки',
    description: 'Дизайн и инструменты разработки',
    icons: ['figma'],
  },
  {
    title: 'Базы данных и бэкенд',
    description: 'Системы управления данными и бэкенд сервисы',
    icons: ['supabase', 'firebase', 'postgresql', 'mongodb'],
  },
]
