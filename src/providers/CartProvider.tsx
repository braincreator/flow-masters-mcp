'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from 'react'
import { useAuth } from '@/hooks/useAuth'
import { CartSession, Product } from '@/payload-types'
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '@/utilities/api'
import { toast } from '@/components/ui/use-toast'
import { Locale } from '@/constants'

// Key for SWR
export const CART_KEY = '/api/cart'

interface CartContextType {
  cart: CartSession | null
  itemCount: number
  total: number
  isLoading: boolean
  error: Error | null
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  emptyCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({
  children,
  locale = 'en',
}: {
  children: ReactNode
  locale?: Locale
}) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartSession | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCart = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      const data = await getCart()
      setCart(data)
      setError(null)
    } catch (err) {
      // Don't set error for 404 (no cart) or 401 (not authenticated)
      if (err instanceof Error && !err.message.includes('404') && !err.message.includes('401')) {
        console.error('Error fetching cart:', err)
        setError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch cart on mount and when auth state changes
  useEffect(() => {
    fetchCart()
  }, [isAuthenticated])

  // Calculate itemCount and total
  const items = cart?.items ?? []
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const total = items.reduce((sum, item) => {
    const product = (typeof item.product === 'object' ? item.product : null) as Product | null
    const price = item.price
    return sum + price * item.quantity
  }, 0)

  // Add item to cart
  const addItem = useCallback(
    async (productId: string, quantity: number = 1): Promise<void> => {
      try {
        setIsLoading(true)
        await addToCart({ productId, quantity })
        await fetchCart() // Refresh cart after adding
        toast({
          title: 'Item added to cart',
          description: `${quantity} item(s) added to your cart.`,
        })
      } catch (err) {
        console.error('Error adding item to cart:', err)
        toast({
          title: 'Error adding item',
          description: err instanceof Error ? err.message : 'Failed to add item to cart',
          variant: 'destructive',
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart],
  )

  // Update item quantity
  const updateItem = useCallback(
    async (itemId: string, quantity: number): Promise<void> => {
      try {
        setIsLoading(true)
        await updateCartItemQuantity({ itemId, quantity })
        await fetchCart() // Refresh cart after updating
      } catch (err) {
        console.error('Error updating cart item:', err)
        toast({
          title: 'Error updating item',
          description: err instanceof Error ? err.message : 'Failed to update item',
          variant: 'destructive',
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart],
  )

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId: string): Promise<void> => {
      try {
        setIsLoading(true)
        await removeFromCart({ itemId })
        await fetchCart() // Refresh cart after removing
      } catch (err) {
        console.error('Error removing cart item:', err)
        toast({
          title: 'Error removing item',
          description: err instanceof Error ? err.message : 'Failed to remove item',
          variant: 'destructive',
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [fetchCart],
  )

  // Empty cart
  const emptyCart = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      await clearCart()
      await fetchCart() // Refresh cart after clearing
    } catch (err) {
      console.error('Error clearing cart:', err)
      toast({
        title: 'Error clearing cart',
        description: err instanceof Error ? err.message : 'Failed to clear cart',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchCart])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      cart,
      itemCount,
      total,
      isLoading,
      error,
      addItem,
      updateItem,
      removeItem,
      emptyCart,
      refreshCart: fetchCart,
    }),
    [
      cart,
      itemCount,
      total,
      isLoading,
      error,
      addItem,
      updateItem,
      removeItem,
      emptyCart,
      fetchCart,
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
