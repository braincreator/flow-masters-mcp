'use client'

import { useContext } from 'react'
import { CartContext } from '@/providers/CartProvider'
import type { CartContextType } from '@/providers/CartProvider'
import type { CartSession, Product } from '@/payload-types'

/**
 * Custom hook to select specific parts of the cart context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 *
 * @param selector A function that selects specific parts of the cart context
 * @returns The selected parts of the cart context
 */
export function useCartSelector<T>(selector: (context: CartContextType) => T): T {
  const context = useContext(CartContext)

  if (context === undefined) {
    throw new Error('useCartSelector must be used within a CartProvider')
  }

  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the cart items and count
 */
export function useCartItems() {
  return useCartSelector((context) => ({
    items: context.cart?.items || [],
    itemCount: context.itemCount,
    isLoading: context.isLoading,
  }))
}

/**
 * Select only the cart total
 */
export function useCartTotal() {
  return useCartSelector((context) => ({
    total: context.total,
    currency: context.cart?.currency || 'USD',
    isLoading: context.isLoading,
  }))
}

/**
 * Select only the cart actions
 */
export function useCartActions() {
  return useCartSelector((context) => ({
    addItem: context.addItem,
    updateItem: context.updateItem,
    removeItem: context.removeItem,
    emptyCart: context.emptyCart,
    refreshCart: context.refreshCart,
    isLoading: context.isLoading,
  }))
}

/**
 * Select only the cart status
 */
export function useCartStatus() {
  return useCartSelector((context) => ({
    isLoading: context.isLoading,
    error: context.error,
    isEmpty: !context.cart?.items?.length,
    itemCount: context.itemCount,
  }))
}

/**
 * Get a specific item from the cart by product ID
 */
export function useCartItem(productId: string) {
  return useCartSelector((context) => {
    const items = context.cart?.items || []
    const item = items.find((item) => {
      const product = (typeof item.product === 'object' ? item.product : null) as Product | null
      return product?.id === productId
    })

    return {
      item: item || null,
      quantity: item?.quantity || 0,
      isInCart: !!item,
      addItem: context.addItem,
      updateItem: item ? context.updateItem.bind(null, item.id) : null,
      removeItem: item ? context.removeItem.bind(null, item.id) : null,
    }
  })
}
