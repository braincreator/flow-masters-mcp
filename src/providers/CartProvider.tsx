'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { Product as PayloadProduct } from '@/payload-types'
import { Locale } from '@/constants'

interface CartItem {
  product: PayloadProduct
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  addToCart: (product: PayloadProduct, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  locale: Locale
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: React.ReactNode
  locale: Locale
}

export function CartProvider({ children, locale }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = useCallback((product: PayloadProduct, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }

      return [...currentItems, { product, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const isInCart = useCallback(
    (productId: string) => items.some((item) => item.product.id === productId),
    [items],
  )

  const itemCount = useMemo(() => {
    return items.reduce((count, item) => count + (item.quantity || 1), 0)
  }, [items])

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const price =
        item.product.pricing?.[locale]?.amount ||
        item.product.pricing?.basePrice ||
        item.product.price ||
        0
      return sum + price * (item.quantity || 1)
    }, 0)
  }, [items, locale])

  const value = useMemo(
    () => ({
      items,
      itemCount,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
      locale,
    }),
    [
      items,
      itemCount,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
      locale,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}
