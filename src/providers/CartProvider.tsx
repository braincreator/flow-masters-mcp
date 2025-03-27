'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { Product as PayloadProduct } from '@/payload-types'

interface CartItem {
  product: PayloadProduct
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: PayloadProduct) => void
  removeFromCart: (productId: string) => void
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = useCallback((product: PayloadProduct) => {
    setItems((currentItems) => {
      if (currentItems.some((item) => item.product.id === product.id)) {
        return currentItems
      }
      return [...currentItems, { product }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId))
  }, [])

  const isInCart = useCallback(
    (productId: string) => items.some((item) => item.product.id === productId),
    [items],
  )

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
