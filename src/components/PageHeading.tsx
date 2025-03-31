import React from 'react'
import { cn } from '@/utilities/ui'

interface PageHeadingProps {
  title: string
  description?: string
  center?: boolean
  className?: string
}

export function PageHeading({ title, description, center, className }: PageHeadingProps) {
  return (
    <div className={cn('mb-10 space-y-4', center && 'text-center', className)}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>

      {description && <p className="text-lg text-muted-foreground max-w-[700px]">{description}</p>}
    </div>
  )
}
