'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface SkipLink {
  href: string
  label: string
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
]

interface SkipLinksProps {
  links?: SkipLink[]
  className?: string
}

/**
 * Skip links component for keyboard navigation accessibility
 * These links are hidden by default and become visible when focused
 */
export function SkipLinks({ links = DEFAULT_SKIP_LINKS, className }: SkipLinksProps) {
  const t = useTranslations('Accessibility')

  const handleSkipClick = (href: string) => {
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
      // Set focus to the target element
      if (target instanceof HTMLElement) {
        target.focus()
        // If the target doesn't have tabindex, add it temporarily
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1')
          target.addEventListener('blur', () => {
            target.removeAttribute('tabindex')
          }, { once: true })
        }
      }
    }
  }

  return (
    <nav 
      className={cn(
        'sr-only focus-within:not-sr-only',
        'fixed top-0 left-0 z-[9999] w-full',
        'bg-primary text-primary-foreground',
        'p-2',
        className
      )}
      aria-label={t('skipNavigation')}
    >
      <ul className="flex gap-4 justify-center">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              onClick={(e) => {
                e.preventDefault()
                handleSkipClick(link.href)
              }}
              className={cn(
                'inline-block px-4 py-2 rounded',
                'bg-primary-foreground text-primary',
                'font-medium text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'hover:bg-primary-foreground/90',
                'transition-colors'
              )}
            >
              {t(link.label) || link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Hook to manage focus trap for modals and dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const focusableElementsSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ')

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(focusableElementsSelector)
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Trigger close action - this should be handled by the parent component
        const closeEvent = new CustomEvent('escape-pressed')
        container.dispatchEvent(closeEvent)
      }
    }

    if (isActive) {
      document.addEventListener('keydown', handleTabKey)
      document.addEventListener('keydown', handleEscapeKey)
      firstElement?.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }

  return { trapFocus }
}

/**
 * Component to announce dynamic content changes to screen readers
 */
interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive'
  atomic?: boolean
  className?: string
}

export function LiveRegion({ 
  message, 
  politeness = 'polite', 
  atomic = true,
  className 
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  )
}

/**
 * Enhanced button component with better accessibility
 */
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Loading...',
  disabled,
  className,
  ...props
}: AccessibleButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-md font-medium',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'transition-colors',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
      'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
      'h-8 px-3 text-sm': size === 'sm',
      'h-10 px-4': size === 'md',
      'h-12 px-6 text-lg': size === 'lg',
    },
    className
  )

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...(loading && { 'aria-describedby': 'loading-description' })}
      {...props}
    >
      {loading ? (
        <>
          <span className="sr-only" id="loading-description">
            {loadingText}
          </span>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
