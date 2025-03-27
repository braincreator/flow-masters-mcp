'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

/**
 * This component manually hydrates the cart state from localStorage
 * due to using skipHydration: true in the Zustand store configuration
 */
export function CartHydration() {
  const { addToCart, setLocale, clearCart, updateItemCount } = useCart()

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
              addToCart(item.product, item.quantity)
            }
          })
          
          // Make sure itemCount is updated after adding items
          updateItemCount()
        }

        // Restore locale if available
        if (state?.locale) {
          setLocale(state.locale)
        }
      }
    } catch (error) {
      console.error('Error hydrating cart from localStorage:', error)
    }
  }, [addToCart, setLocale, clearCart, updateItemCount])

  // This component doesn't render anything
  return null
}

export default CartHydration
