import React from 'react'

interface TagBadgeProps {
  tag: string | { tag?: string | null } | { id?: string | null; tag?: string | null }
  className?: string
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  const displayTag = typeof tag === 'string' ? tag : tag.tag || ''

  return (
    <span
      className={`text-xs text-accent bg-accent/5 px-2 py-1 rounded-full
        border border-accent/20 transition-colors duration-200 ${className || ''}`}
    >
      {displayTag}
    </span>
  )
}
