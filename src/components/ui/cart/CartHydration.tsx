'use client'

import { useEffect } from 'react'
import { useCart } from '@/providers/CartProvider'

/**
 * This component manually hydrates the cart state from localStorage
 * due to using skipHydration: true in the Zustand store configuration
 */
export function CartHydration() {
  const { addItem, clearCart, mutateCart } = useCart()

  useEffect(() => {
    // Get cart data from localStorage
    try {
      const storedCart = localStorage.getItem('shopping-cart')

      if (storedCart) {
        const { state } = JSON.parse(storedCart)

        // Restore cart items
        if (state?.items?.length) {
          // Clear existing items first to avoid duplicates
          clearCart()

          state.items.forEach((item: any) => {
            if (item.product && item.quantity) {
              addItem(item.product, item.quantity)
            }
          })

          // Обновляем корзину после добавления элементов
          mutateCart()
        }
      }
    } catch (error) {
      console.error('Error hydrating cart from localStorage:', error)
    }
  }, [addItem, clearCart, mutateCart])

  // This component doesn't render anything
  return null
}

export default CartHydration
