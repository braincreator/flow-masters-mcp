import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
  centered?: boolean
}

export function PageHeader({
  title,
  description,
  actions,
  centered = false,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        {
          'text-center items-center': centered,
          'items-start': !centered,
        },
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-col gap-1 md:gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
