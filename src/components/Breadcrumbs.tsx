'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import AnimateInView from '@/components/AnimateInView'

export type BreadcrumbItem = {
  label: string
  url?: string
  active?: boolean
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  homeLabel?: string
  variant?: 'default' | 'fancy' | 'minimal' | 'pills' | 'cards' | 'modern'
  showHomeIcon?: boolean
  className?: string
}

const breadcrumbsVariants = cva('flex items-center flex-wrap', {
  variants: {
    variant: {
      default: 'space-x-2',
      fancy: 'space-x-3 font-medium',
      minimal: 'space-x-1 text-xs opacity-80',
      pills: 'space-x-1',
      cards: 'space-x-2',
      modern: 'space-x-1',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const breadcrumbItemVariants = cva('flex items-center transition-all duration-200', {
  variants: {
    variant: {
      default: 'text-muted-foreground hover:text-foreground text-sm',
      fancy: 'text-muted-foreground hover:text-primary hover:scale-105',
      minimal: 'text-muted-foreground hover:text-foreground',
      pills:
        'px-3 py-1 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50',
      cards:
        'px-3 py-1.5 bg-card text-muted-foreground hover:text-foreground rounded-md border border-border/30 hover:border-border/60 shadow-sm hover:shadow',
      modern:
        'px-3 py-1.5 text-sm text-muted-foreground hover:text-primary relative overflow-hidden group',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const breadcrumbActiveItemVariants = cva('font-medium flex items-center', {
  variants: {
    variant: {
      default: 'text-foreground',
      fancy: 'text-primary',
      minimal: 'text-foreground',
      pills: 'bg-primary/10 text-primary px-3 py-1 rounded-full',
      cards: 'px-3 py-1.5 bg-primary/10 text-primary rounded-md border border-primary/30 shadow-sm',
      modern: 'px-3 py-1.5 text-primary relative overflow-hidden',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const separatorVariants = cva('flex text-muted-foreground', {
  variants: {
    variant: {
      default: 'mx-2',
      fancy: 'mx-3 text-primary/40',
      minimal: 'mx-1 opacity-60',
      pills: 'mx-1',
      cards: 'mx-2',
      modern: 'mx-0.5',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export default function Breadcrumbs({
  items,
  homeLabel = 'Home',
  variant = 'default',
  showHomeIcon = true,
  className,
}: BreadcrumbsProps) {
  const pathname = usePathname()

  // Добавляем микро-анимацию при наведении
  const chevronClasses = cn(
    'h-4 w-4',
    variant === 'fancy' ? 'text-primary/60' : 'text-muted-foreground',
    variant === 'modern' ? 'text-primary/40' : '',
  )

  // Добавляем стилизацию для домашней иконки
  const homeIconClasses = cn(
    'h-4 w-4 mr-1',
    variant === 'fancy' ? 'text-primary' : 'text-muted-foreground',
    variant === 'modern' ? 'text-primary/70 group-hover:text-primary transition-colors' : '',
  )

  // Эффект для активного элемента в pills варианте
  const pillsActiveClass = variant === 'pills' ? 'animate-pulse-subtle' : ''

  // Эффект для modern варианта
  const modernItemEffect =
    variant === 'modern'
      ? 'after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-4/5 group-hover:after:left-[10%]'
      : ''

  return (
    <AnimateInView direction="right" className={cn('mb-8', className)}>
      <nav aria-label="Breadcrumb">
        <ol className={cn(breadcrumbsVariants({ variant }))}>
          {/* Домашняя страница */}
          <li>
            <Link
              href={pathname ? `/${pathname.split('/')[1]}` : '/'}
              className={cn(breadcrumbItemVariants({ variant }), 'group')}
            >
              {showHomeIcon ? (
                <span className="flex items-center">
                  <Home
                    className={cn(
                      homeIconClasses,
                      'group-hover:scale-110 transition-transform duration-300',
                    )}
                  />
                  {variant !== 'minimal' && (
                    <span
                      className={cn(
                        'ml-1',
                        variant === 'modern' &&
                          'group-hover:text-primary transition-colors duration-300',
                      )}
                    >
                      {homeLabel}
                    </span>
                  )}
                </span>
              ) : (
                <span
                  className={cn(
                    variant === 'modern' &&
                      'group-hover:text-primary transition-colors duration-300',
                  )}
                >
                  {homeLabel}
                </span>
              )}
              {variant === 'modern' && <span className={modernItemEffect}></span>}
            </Link>
          </li>

          {/* Разделитель после домашней страницы */}
          {items.length > 0 && (
            <li className={separatorVariants({ variant })}>
              <ChevronRight
                className={cn(
                  chevronClasses,
                  variant === 'modern' &&
                    'transform rotate-0 transition-transform group-hover:rotate-90',
                )}
              />
            </li>
          )}

          {/* Остальные элементы */}
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <li className="relative">
                {item.url && !item.active ? (
                  <Link
                    href={item.url}
                    className={cn(breadcrumbItemVariants({ variant }), 'group')}
                  >
                    <span
                      className={cn(
                        'group-hover:underline underline-offset-4 decoration-primary/30',
                        variant === 'modern' && 'no-underline',
                      )}
                    >
                      {item.label}
                    </span>
                    {variant === 'modern' && <span className={modernItemEffect}></span>}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      breadcrumbActiveItemVariants({ variant }),
                      pillsActiveClass,
                      'truncate max-w-[200px] md:max-w-[300px] lg:max-w-full',
                      variant === 'modern' &&
                        'before:content-[""] before:absolute before:bottom-0 before:left-[10%] before:w-4/5 before:h-0.5 before:bg-primary before:opacity-70',
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>

              {/* Разделитель между элементами, кроме последнего */}
              {index < items.length - 1 && (
                <li className={separatorVariants({ variant })}>
                  <ChevronRight className={chevronClasses} />
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </AnimateInView>
  )
}
