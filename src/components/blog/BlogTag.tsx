'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import { Tag as TagIcon } from 'lucide-react'

// Цветовая схема для тегов (можно расширить или изменить)
const tagColors = [
  'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40',
  'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40',
  'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/40',
  'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/40',
  'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40',
  'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/40',
  'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/40',
  'bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-800/40',
]

// Функция для получения цвета тега на основе его ID
const getTagColor = (id: string): string => {
  // Используем последние символы ID для определения индекса цвета
  const lastChar = id.charCodeAt(id.length - 1) || 0
  const colorIndex = lastChar % tagColors.length
  return tagColors[colorIndex]
}

interface BlogTagProps {
  tag: {
    id: string
    title: string
    slug: string
  }
  locale: string
  showIcon?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export const BlogTag: React.FC<BlogTagProps> = ({
  tag,
  locale,
  showIcon = true,
  className,
  size = 'sm',
}) => {
  if (!tag || !tag.title) return null

  const sizeClasses = {
    sm: 'text-[10px] py-0.5 px-2',
    md: 'text-xs py-1 px-2.5',
  }

  return (
    <Link
      href={`/${locale}/blog?tag=${tag.slug}`}
      className={cn(
        'inline-flex items-center rounded-full transition-colors',
        'font-medium whitespace-nowrap',
        getTagColor(tag.id),
        sizeClasses[size],
        className
      )}
      title={`View posts tagged with ${tag.title}`}
    >
      {showIcon && <TagIcon className="mr-1 h-2.5 w-2.5" />}
      {tag.title}
    </Link>
  )
}

export default BlogTag
