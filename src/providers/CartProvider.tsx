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
import { CartSession, Product, Service } from '@/payload-types'
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

// Экспортируем типы для переиспользования
export type CartItemType = 'product' | 'service'

// Определяем типы для элементов корзины
interface BaseCartItem {
  itemType: CartItemType
  quantity: number
  priceSnapshot: number
  titleSnapshot?: string
  id?: string
}

export interface CartProductItem extends BaseCartItem {
  itemType: 'product'
  product: string | Product | null
  service?: undefined
}

export interface CartServiceItem extends BaseCartItem {
  itemType: 'service'
  service: string | Service | null
  product?: undefined
}

export type CartItem = CartProductItem | CartServiceItem

export interface CartContextType {
  cart: CartSession | null
  items: CartItem[]
  itemCount: number
  total: number
  isLoading: boolean
  error: Error | null

  // Основные методы для работы с корзиной
  addItem: (
    itemId: string,
    itemTypeOrQuantity?: CartItemType | number,
    quantity?: number,
  ) => Promise<void>
  updateItem: (itemId: string, itemType: CartItemType, quantity: number) => Promise<void>
  removeItem: (itemId: string, itemType?: CartItemType) => Promise<void>
  emptyCart: () => Promise<void>
  refreshCart: () => Promise<void>

  // Алиасы для обратной совместимости
  add: (
    itemId: string,
    itemTypeOrQuantity?: CartItemType | number,
    quantity?: number,
  ) => Promise<void>
  // Алиас для emptyCart
  clear: () => Promise<void>
  // Алиас для removeItem
  remove: (itemId: string, itemType?: CartItemType) => Promise<void>
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

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
      console.log('CartProvider: Fetching cart data...')
      const data = await getCart()
      console.log('CartProvider: Cart data received:', data)
      console.log('CartProvider: Cart items:', data?.items || [])
      setCart(data)
      setError(null)
    } catch (err) {
      // Don't set error for 404 (no cart) or 401 (not authenticated)
      if (err instanceof Error && !err.message.includes('404') && !err.message.includes('401')) {
        console.error('CartProvider: Error fetching cart:', err)
        setError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Добавим функцию для повторных попыток обновления корзины
  const retryFetchCart = useCallback(async (maxRetries = 3): Promise<void> => {
    let retries = 0
    let success = false

    while (retries < maxRetries && !success) {
      try {
        console.log(`CartProvider: Attempting to fetch cart (attempt ${retries + 1}/${maxRetries})`)
        const data = await getCart()
        if (data && data.items) {
          console.log(`CartProvider: Cart successfully fetched on attempt ${retries + 1}`, data)
          setCart(data)
          setError(null)
          success = true
        } else {
          console.log(`CartProvider: Empty cart data on attempt ${retries + 1}`, data)
          await new Promise((resolve) => setTimeout(resolve, 500))
          retries++
        }
      } catch (err) {
        console.error(`CartProvider: Error fetching cart on attempt ${retries + 1}:`, err)
        await new Promise((resolve) => setTimeout(resolve, 500))
        retries++
      }
    }

    if (!success) {
      console.error('CartProvider: Failed to fetch cart after multiple attempts')
    }

    setIsLoading(false)
  }, [])

  // Fetch cart on mount and when auth state changes
  useEffect(() => {
    fetchCart()
  }, [isAuthenticated])

  // Calculate itemCount and total
  const items = cart?.items ?? []
  const itemCount = items.reduce((count, item) => count + (item.quantity || 1), 0)
  const total = items.reduce((sum, item) => {
    const price = item.priceSnapshot || 0
    return sum + price * (item.quantity || 1)
  }, 0)

  // Add item to cart - универсальный метод с поддержкой разных сигнатур
  const addItem = useCallback(
    async (
      itemId: string,
      itemTypeOrQuantity?: CartItemType | number,
      maybeQuantity?: number,
    ): Promise<void> => {
      try {
        console.log('CartProvider: addItem called with params:', {
          itemId,
          itemTypeOrQuantity,
          maybeQuantity,
        })
        setIsLoading(true)

        // Определение типа элемента и количества на основе сигнатуры
        let itemType: CartItemType = 'product'
        let quantity: number = 1

        // Вариант 1: addItem(id) - тип по умолчанию продукт, количество 1
        // Вариант 2: addItem(id, 'product'|'service') - указан тип, количество 1
        // Вариант 3: addItem(id, 5) - тип по умолчанию продукт, указано количество
        // Вариант 4: addItem(id, 'product'|'service', 5) - указаны и тип и количество

        if (typeof itemTypeOrQuantity === 'string') {
          // Вариант 2 или 4: указан тип
          itemType = itemTypeOrQuantity as CartItemType
          if (typeof maybeQuantity === 'number') {
            // Вариант 4: указаны и тип и количество
            quantity = maybeQuantity
          }
        } else if (typeof itemTypeOrQuantity === 'number') {
          // Вариант 3: указано только количество
          quantity = itemTypeOrQuantity
        }

        console.log('CartProvider: Calling addToCart with params:', { itemId, itemType, quantity })

        if (!itemId) {
          throw new Error('Item ID is required')
        }

        await addToCart(itemId, itemType, quantity)
        console.log('CartProvider: Item successfully added to cart, now refreshing cart data')

        // Используем улучшенную функцию с повторными попытками обновления корзины
        await retryFetchCart()

        toast({
          title: 'Item added to cart',
          description: `${quantity} item(s) added to your cart.`,
        })
        console.log('CartProvider: addItem complete, toast notification shown')
      } catch (err) {
        console.error('CartProvider: Error adding item to cart:', err)
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
    [retryFetchCart],
  )

  // Update item quantity - обновляем с поддержкой типа элемента
  const updateItem = useCallback(
    async (itemId: string, itemType: CartItemType, quantity: number): Promise<void> => {
      try {
        setIsLoading(true)

        // Если количество 0 или меньше, удаляем товар из корзины
        if (quantity <= 0) {
          await removeItem(itemId, itemType)
          return
        }

        await updateCartItemQuantity(itemId, itemType, quantity)
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

  // Remove item from cart - обновляем с поддержкой типа элемента
  const removeItem = useCallback(
    async (itemId: string, itemType?: CartItemType): Promise<void> => {
      try {
        setIsLoading(true)
        await removeFromCart(itemId, itemType)
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
      items: items as CartItem[],
      itemCount,
      total,
      isLoading,
      error,
      addItem,
      updateItem,
      removeItem,
      emptyCart,
      refreshCart: fetchCart,
      // Алиасы для обратной совместимости
      add: addItem,
      clear: emptyCart,
      remove: removeItem,
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

// Custom hook to use the cart context
export function useCart(locale?: Locale) {
  const context = useContext(CartContext)

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}
