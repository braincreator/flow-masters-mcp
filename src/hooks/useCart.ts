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
  itemCount: number
  total: number
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  setLocale: (locale: Locale) => void
  persistState: () => void
  loadServerCart: (userId: string) => Promise<boolean>
  updateItemCount: () => void
}

const MAX_QUANTITY = 99

// Get product price - accounting for locale-specific pricing or falling back to base price
const getProductPrice = (product: Product, locale: Locale): number => {
  // Handle different product pricing structures
  // @ts-ignore - Product type doesn't fully reflect the actual runtime structure
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
      itemCount: state.itemCount,
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

// Function to sync cart with server for authenticated users
const syncCartWithServer = async (items: CartItem[], locale: Locale, userId?: string) => {
  if (!userId || typeof window === 'undefined') return

  try {
    // Generate unique session ID for the browser
    let sessionId = localStorage.getItem('cart_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('cart_session_id', sessionId)
    }

    // Prepare cart items data
    const cartItems = items.map((item) => ({
      product: item.product.id,
      quantity: item.quantity,
      price: getProductPrice(item.product, locale),
    }))

    // Calculate total
    const total = items.reduce(
      (sum, item) => sum + getProductPrice(item.product, locale) * item.quantity,
      0,
    )

    // Send cart data to server
    const response = await fetch('/api/cart/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        items: cartItems,
        total,
        currency: locale === 'ru' ? 'RUB' : 'USD',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to sync cart with server')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Cart] Successfully synced cart with server')
    }
  } catch (error) {
    console.error('[Cart] Error syncing cart with server:', error)
  }
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [] as CartItem[],
      locale: 'en' as Locale,
      itemCount: 0,

      updateItemCount: () => {
        set((state) => ({
          itemCount: state.items.reduce((count, item) => count + item.quantity, 0),
        }))
      },

      addToCart: (product, quantity = 1) => {
        set((state) => {
          if (!product?.id || quantity < 1) return state

          const existingItem = state.items.find((item) => item.product.id === product.id)

          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, MAX_QUANTITY)
            const newItems = state.items.map((item) =>
              item.product.id === product.id ? { ...item, quantity: newQuantity } : item,
            )

            const newItemCount = newItems.reduce((count, item) => count + item.quantity, 0)

            // Trigger manual persist after state update
            setTimeout(
              () => manualPersist({ ...get(), items: newItems, itemCount: newItemCount }),
              0,
            )

            // Sync with server if user is logged in
            const userId = localStorage.getItem('userId')
            if (userId) {
              syncCartWithServer(newItems, state.locale, userId)
            }

            return {
              items: newItems,
              itemCount: newItemCount,
            }
          }

          const newItems = [...state.items, { product, quantity: Math.min(quantity, MAX_QUANTITY) }]
          const newItemCount = newItems.reduce((count, item) => count + item.quantity, 0)

          // Trigger manual persist after state update
          setTimeout(() => manualPersist({ ...get(), items: newItems, itemCount: newItemCount }), 0)

          // Sync with server if user is logged in
          const userId = localStorage.getItem('userId')
          if (userId) {
            syncCartWithServer(newItems, state.locale, userId)
          }

          return {
            items: newItems,
            itemCount: newItemCount,
          }
        })
      },

      removeFromCart: (productId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.product.id !== productId)
          const newItemCount = newItems.reduce((count, item) => count + item.quantity, 0)

          // Trigger manual persist after state update
          setTimeout(() => manualPersist({ ...get(), items: newItems, itemCount: newItemCount }), 0)

          // Sync with server if user is logged in
          const userId = localStorage.getItem('userId')
          if (userId) {
            syncCartWithServer(newItems, state.locale, userId)
          }

          return {
            items: newItems,
            itemCount: newItemCount,
          }
        })
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          const newItems = state.items
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: Math.min(Math.max(0, quantity), MAX_QUANTITY) }
                : item,
            )
            .filter((item) => item.quantity > 0)

          const newItemCount = newItems.reduce((count, item) => count + item.quantity, 0)

          // Trigger manual persist after state update
          setTimeout(() => manualPersist({ ...get(), items: newItems, itemCount: newItemCount }), 0)

          // Sync with server if user is logged in
          const userId = localStorage.getItem('userId')
          if (userId) {
            syncCartWithServer(newItems, state.locale, userId)
          }

          return {
            items: newItems,
            itemCount: newItemCount,
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          itemCount: 0,
        })

        // Trigger manual persist after state update
        setTimeout(() => manualPersist({ ...get() }), 0)

        // Sync with server if user is logged in
        const userId = localStorage.getItem('userId')
        if (userId) {
          syncCartWithServer([], get().locale, userId)
        }
      },

      isInCart: (productId) => {
        return get().items.some((item) => item.product.id === productId)
      },

      setLocale: (locale) => {
        set({ locale })

        // Trigger manual persist after state update
        setTimeout(() => manualPersist({ ...get() }), 0)

        // Sync with server if user is logged in
        const userId = localStorage.getItem('userId')
        if (userId) {
          syncCartWithServer(get().items, locale, userId)
        }
      },

      get total() {
        const { items, locale } = get()
        return items.reduce(
          (sum, item) => sum + getLocalePrice(item.product, locale) * item.quantity,
          0,
        )
      },

      // Load cart from server for authenticated users
      loadServerCart: async (userId: string) => {
        try {
          if (!userId) return false

          const response = await fetch(`/api/cart/user/${userId}`)

          if (!response.ok) return false

          const data = await response.json()

          if (data.items && Array.isArray(data.items)) {
            // Convert server items format to cart format
            const cartItems = []

            for (const item of data.items) {
              if (item.product && item.quantity) {
                cartItems.push({
                  product: item.product, // Assuming this is the full product object
                  quantity: item.quantity,
                })
              }
            }

            if (cartItems.length > 0) {
              set({ items: cartItems })
              return true
            }
          }

          return false
        } catch (error) {
          console.error('[Cart] Error loading server cart:', error)
          return false
        }
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
        itemCount: state.itemCount,
      }),
      skipHydration: true,
      version: 1, // Version for future migration support
    },
  ),
)
