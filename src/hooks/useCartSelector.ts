'use client'

import { useContext } from 'react'
import { CartContext, CartItemType } from '@/providers/CartProvider'
import type { CartContextType } from '@/providers/CartProvider'
import type { CartSession, Product, Service } from '@/payload-types'

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
 * Get a specific item from the cart by ID and optionally type
 */
export function useCartItem(itemId: string, itemType?: CartItemType) {
  return useCartSelector((context) => {
    const items = context.cart?.items || []
    const item = items.find((item) => {
      // Если указан тип элемента, проверяем соответствие
      if (itemType && item.itemType !== itemType) return false
      
      // Проверяем идентификатор в зависимости от типа элемента
      if (item.itemType === 'product') {
        const productId = typeof item.product === 'object' ? item.product?.id : item.product
        return productId === itemId
      } else if (item.itemType === 'service') {
        const serviceId = typeof item.service === 'object' ? item.service?.id : item.service
        return serviceId === itemId
      }
      return false
    })

    return {
      item: item || null,
      quantity: item?.quantity || 0,
      isInCart: !!item,
      addItem: context.addItem,
      updateItem: item ? 
        ((quantity: number) => context.updateItem(itemId, item.itemType as CartItemType, quantity)) : 
        null,
      removeItem: item ? 
        (() => context.removeItem(itemId, item.itemType as CartItemType)) : 
        null,
    }
  })
}
