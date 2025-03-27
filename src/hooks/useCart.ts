'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/payload-types'
import { Locale } from '@/constants'
import { getLocalePrice } from '@/utilities/formatPrice'

interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  locale: Locale
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  setLocale: (locale: Locale) => void
  itemCount: number
  total: number
  persistState: () => void
}

const MAX_QUANTITY = 99

const getProductPrice = (product: Product, locale: Locale): number => {
  return product.pricing?.[locale]?.amount || product.pricing?.basePrice || product.price || 0
}

// Custom storage implementation with enhanced error handling and debug logging
const createCustomStorage = () => {
  const storageKey = 'shopping-cart'

  return {
    getItem: (name: string): string => {
      if (typeof window === 'undefined') return ''

      try {
        const item = localStorage.getItem(name)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Storage] Reading ${name}:`, item ? 'Data found' : 'No data')
        }
        return item || ''
      } catch (error) {
        console.error(`[Storage] Error getting ${name} from localStorage:`, error)
        return ''
      }
    },

    setItem: (name: string, value: string): void => {
      if (typeof window === 'undefined') return

      try {
        localStorage.setItem(name, value)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Storage] Successfully stored ${name}, size: ${value.length} bytes`)
        }
      } catch (error) {
        console.error(`[Storage] Error setting ${name} in localStorage:`, error)

        // Try to handle quota exceeded errors
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          try {
            // Clean up old items if quota exceeded
            localStorage.removeItem('__lastKnownCart')
            // Save current as last known before failing
            localStorage.setItem(
              '__lastKnownCart',
              JSON.stringify({ timestamp: new Date().toISOString(), data: value }),
            )
            console.warn('[Storage] Quota exceeded, saved minimal backup')
          } catch {
            console.error('[Storage] Failed to save backup after quota exceeded')
          }
        }
      }
    },

    removeItem: (name: string): void => {
      if (typeof window === 'undefined') return

      try {
        localStorage.removeItem(name)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Storage] Successfully removed ${name}`)
        }
      } catch (error) {
        console.error(`[Storage] Error removing ${name} from localStorage:`, error)
      }
    },
  }
}

// Manual persist function
const manualPersist = (state: any) => {
  if (typeof window === 'undefined') return

  try {
    const stateToStore = {
      items: state.items,
      locale: state.locale,
    }

    localStorage.setItem(
      'shopping-cart',
      JSON.stringify({
        state: stateToStore,
        version: 1,
      }),
    )

    if (process.env.NODE_ENV === 'development') {
      console.log('[Cart] Manually persisted cart state')
    }
  } catch (error) {
    console.error('[Cart] Error manually persisting cart state:', error)
  }
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [] as CartItem[],
      locale: 'en' as Locale,

      addToCart: (product, quantity = 1) => {
        set((state) => {
          if (!product?.id || quantity < 1) return state

          const existingItem = state.items.find((item) => item.product.id === product.id)

          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, MAX_QUANTITY)
            const newState = {
              items: state.items.map((item) =>
                item.product.id === product.id ? { ...item, quantity: newQuantity } : item,
              ),
            }

            // Trigger manual persist after state update
            setTimeout(() => manualPersist({ ...get() }), 0)

            return newState
          }

          const newState = {
            items: [...state.items, { product, quantity: Math.min(quantity, MAX_QUANTITY) }],
          }

          // Trigger manual persist after state update
          setTimeout(() => manualPersist({ ...get() }), 0)

          return newState
        })
      },

      removeFromCart: (productId) => {
        set((state) => {
          const newState = {
            items: state.items.filter((item) => item.product.id !== productId),
          }

          // Trigger manual persist after state update
          setTimeout(() => manualPersist({ ...get() }), 0)

          return newState
        })
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          const newState = {
            items: state.items
              .map((item) =>
                item.product.id === productId
                  ? { ...item, quantity: Math.min(Math.max(0, quantity), MAX_QUANTITY) }
                  : item,
              )
              .filter((item) => item.quantity > 0),
          }

          // Trigger manual persist after state update
          setTimeout(() => manualPersist({ ...get() }), 0)

          return newState
        })
      },

      clearCart: () => {
        set({ items: [] })

        // Trigger manual persist after state update
        setTimeout(() => manualPersist({ ...get() }), 0)
      },

      isInCart: (productId) => {
        return get().items.some((item) => item.product.id === productId)
      },

      setLocale: (locale) => {
        set({ locale })

        // Trigger manual persist after state update
        setTimeout(() => manualPersist({ ...get() }), 0)
      },

      get itemCount() {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },

      get total() {
        const { items, locale } = get()
        return items.reduce(
          (sum, item) => sum + getLocalePrice(item.product, locale) * item.quantity,
          0,
        )
      },

      // Manually persist state on demand
      persistState: () => {
        manualPersist(get())
      },
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => createCustomStorage()),
      partialize: (state) => ({
        items: state.items,
        locale: state.locale,
      }),
      skipHydration: true,
      version: 1, // Version for future migration support
    },
  ),
)
