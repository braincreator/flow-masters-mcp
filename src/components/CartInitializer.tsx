'use client'

import { useEffect, ReactNode, useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { Locale } from '@/constants'

interface CartInitializerProps {
  children: ReactNode
  locale: Locale
}

export default function CartInitializer({ children, locale }: CartInitializerProps) {
  const cart = useCart()
  const { setLocale, addToCart, clearCart, items, locale: cartLocale, persistState } = cart
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle manual hydration once on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      try {
        const storedCart = localStorage.getItem('shopping-cart')

        if (storedCart) {
          const { state } = JSON.parse(storedCart)

          // Restore cart items
          if (state?.items?.length) {
            // Clear existing items first to avoid duplicates
            clearCart()

            // Add items one by one
            state.items.forEach((item: any) => {
              if (item.product && item.quantity) {
                addToCart(item.product, item.quantity)
              }
            })
          }

          // Restore locale if available
          if (state?.locale) {
            setLocale(state.locale)
          }
        }

        setIsHydrated(true)
      } catch (error) {
        console.error('Error hydrating cart from localStorage:', error)
        setIsHydrated(true) // Mark as hydrated even on error to avoid infinite retries
      }
    }
  }, [isHydrated, addToCart, clearCart, setLocale])

  // Force save cart state on page unload
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeUnload = () => {
      try {
        // Manually save current cart state
        const currentState = {
          items,
          locale: cartLocale,
        }

        localStorage.setItem(
          'shopping-cart',
          JSON.stringify({
            state: currentState,
            version: 1,
          }),
        )
      } catch (error) {
        console.error('Error saving cart to localStorage on unload:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [items, cartLocale])

  // Periodically persist cart state (every 5 seconds)
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return

    // Immediate persist once on hydration
    persistState()

    // Then set up interval for periodic saves
    const interval = setInterval(() => {
      persistState()
    }, 5000) // Every 5 seconds

    return () => {
      clearInterval(interval)
    }
  }, [persistState, isHydrated])

  // Update locale when it changes (after hydration)
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      setLocale(locale)
    }
  }, [locale, setLocale, isHydrated])

  return <>{children}</>
}
