'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect, useState } from 'react'
import { fetchGlobal } from '@/utilities/getGlobalsClient'
import { motion, useReducedMotion } from 'framer-motion'
import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { cn } from '@/utilities/ui'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { CartBadge } from '@/components/CartBadge'
import { AuthNav } from '@/components/auth/AuthNav'
import NotificationCenter from '@/components/Notifications/NotificationCenter'

interface HeaderClientProps {
  data: Header
  locale: string
}

const Header = memo(function Header({ data, theme, currentLocale }) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    // Never hide header when mobile menu is open
    if (mobileMenuOpen) {
      setIsVisible(true)
      return
    }

    const currentScrollY = window.scrollY

    if (Math.abs(currentScrollY - lastScrollY) < 50) return

    setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
    setLastScrollY(currentScrollY)
  }, [lastScrollY, mobileMenuOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let ticking = false
    const abortController = new AbortController()
    const signal = abortController.signal

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true, signal })

    return () => {
      abortController.abort()
    }
  }, [handleScroll])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (typeof document === 'undefined') return

    const originalOverflow = document.body.style.overflow

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      // Восстанавливаем оригинальное значение
      document.body.style.overflow = originalOverflow
    }
  }, [mobileMenuOpen])

  const headerAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { y: -20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.5 },
      }

  return (
    <>
      <motion.header
        {...headerAnimation}
        className={cn(
          'fixed top-0 left-0 right-0 h-16 z-50 transform transition-transform duration-300',
          'bg-background/80 backdrop-blur-md border-b border-border/40',
          !isVisible && !mobileMenuOpen && 'translate-y-[-100%]',
        )}
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="container h-full">
          <div className="flex justify-between items-center h-full">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="hover:text-accent transition-colors duration-300"
            >
              <Link href={`/${currentLocale}`}>
                <Logo
                  loading="eager"
                  priority="high"
                  className="invert dark:invert-0 transition-all duration-300 hover:opacity-80"
                  logo={data.logo}
                  size="small"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <HeaderNav data={data} />
              <div className="flex items-center gap-2 ml-4 border-l border-border/40 pl-4">
                <NotificationCenter />
                <AuthNav />
                <ThemeSelector />
                <LanguageSwitcher />
                <Link
                  href={`/${currentLocale}/checkout`}
                  className="relative text-foreground/80 hover:text-accent transition-all duration-300 ml-1"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <CartBadge />
                </Link>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-3 md:hidden">
              <Link
                href={`/${currentLocale}/checkout`}
                className="relative text-foreground/80 hover:text-accent active:scale-95 transition-all touch-manipulation"
                aria-label="Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                <CartBadge />
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="p-2 text-foreground/70 hover:text-accent active:scale-95 transition-all touch-manipulation"
                onClick={() => {
                  const newState = !mobileMenuOpen
                  console.log('Toggle mobile menu:', newState)
                  setMobileMenuOpen(newState)
                  setIsVisible(true) // Always ensure header is visible when toggling menu
                }}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu as a separate component outside the header */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 pt-16 bg-background z-40 md:hidden overflow-auto">
          <div className="container py-6">
            <HeaderNav data={data} mobile={true} />
            <div className="flex items-center justify-center gap-6 pt-6 mt-6 border-t border-border/40">
              <NotificationCenter />
              <AuthNav />
              <ThemeSelector />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </>
  )
})

export function HeaderClient({ data: initialData, locale }: HeaderClientProps) {
  const [data, setData] = useState(initialData)
  const { theme } = useHeaderTheme()
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] || 'en'

  useEffect(() => {
    const loadData = async () => {
      try {
        const newData = await fetchGlobal('header', 1, currentLocale)
        if (newData) {
          setData(newData)
        }
      } catch (error) {
        console.error('Error fetching header data:', error)
        // Можно добавить логику для отображения ошибки пользователю, если необходимо
      }
    }
    loadData()
  }, [currentLocale])

  return <Header data={data} theme={theme} currentLocale={currentLocale} />
}
