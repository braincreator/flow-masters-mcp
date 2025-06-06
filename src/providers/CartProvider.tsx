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
  itemsLoading: Record<string, boolean> // NEW: отслеживает загрузку для отдельных товаров

  // Состояние и функции для модального окна корзины
  isCartModalOpen: boolean
  openCartModal: () => void
  closeCartModal: () => void
  toggleCartModal: () => void

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

// Функция debounce для ограничения частоты вызовов
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      // Проверяем, что функция все еще доступна перед вызовом
      if (typeof func === 'function') {
        try {
          func(...args)
        } catch (error) {
          console.warn('Debounced function execution failed:', error)
        }
      }
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}

export function CartProvider({
  children,
  locale = 'en',
}: {
  children: ReactNode
  locale?: Locale
}) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartSession | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false) // Initialize to false, fetchCart will set it
  const [error, setError] = useState<Error | null>(null)
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({}) // NEW
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false)

  // Helper function for deep equality check of CartSession data
  const areCartDataEqual = (cartA: CartSession | null, cartB: CartSession | null): boolean => {
    if (cartA === cartB) return true
    if (!cartA || !cartB) return cartA === cartB

    if (cartA.id !== cartB.id || cartA.userId !== cartB.userId) {
      // console.log('CartProvider: areCartDataEqual: Basic props differ');
      return false
    }

    const itemsA = cartA.items || []
    const itemsB = cartB.items || []

    if (itemsA.length !== itemsB.length) {
      // console.log('CartProvider: areCartDataEqual: Item lengths differ');
      return false
    }

    // More robust item comparison by creating a comparable string for each item and sorting
    const normalizeItem = (item: CartItem) => {
      const id =
        item.itemType === 'product'
          ? typeof item.product === 'string'
            ? item.product
            : item.product?.id
          : typeof item.service === 'string'
            ? item.service
            : item.service?.id
      return `${id || 'no-id'}-${item.quantity}-${item.priceSnapshot}-${item.itemType}`
    }

    const sortedItemsA = [...itemsA].map(normalizeItem).sort()
    const sortedItemsB = [...itemsB].map(normalizeItem).sort()

    for (let i = 0; i < sortedItemsA.length; i++) {
      if (sortedItemsA[i] !== sortedItemsB[i]) {
        // console.log(`CartProvider: areCartDataEqual: Item at index ${i} differs: ${sortedItemsA[i]} vs ${sortedItemsB[i]}`);
        return false
      }
    }
    // console.log('CartProvider: areCartDataEqual: Carts are equal');
    return true
  }

  const fetchCart = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    // console.log('CartProvider: Fetching cart data...')
    try {
      const data = await getCart()
      // console.log('CartProvider: Cart data received:', data)
      setCart((currentCart) => {
        if (areCartDataEqual(currentCart, data)) {
          // console.log('CartProvider: fetchCart - Cart data is the same, not updating state.');
          return currentCart
        }
        // console.log('CartProvider: fetchCart - Cart data changed, updating state.');
        return data
      })
      setError(null)
    } catch (err) {
      if (err instanceof Error && !err.message.includes('404') && !err.message.includes('401')) {
        console.error('CartProvider: Error fetching cart:', err)
        setError(err)
      } else {
        // For 404 or 401, ensure cart is null if it wasn't already
        setCart((currentCart) => {
          if (currentCart !== null) {
            // console.log('CartProvider: fetchCart - Setting cart to null due to 404/401.');
            return null
          }
          return currentCart
        })
        setError(null) // Clear previous errors on 404/401
      }
    } finally {
      setIsLoading(false)
    }
  }, []) // Removed cart from dependencies as setCart now handles conditional update

  const retryFetchCart = useCallback(async (maxRetries = 3): Promise<void> => {
    setIsLoading(true)
    let retries = 0
    let success = false

    while (retries < maxRetries && !success) {
      try {
        // console.log(`CartProvider: Attempting to fetch cart (attempt ${retries + 1}/${maxRetries})`);
        const data = await getCart()
        setCart((currentCart) => {
          if (areCartDataEqual(currentCart, data)) {
            // console.log(`CartProvider: retryFetchCart - Cart data is the same on attempt ${retries + 1}, not updating state.`);
            success = true // Consider it success if data is same or successfully fetched
            return currentCart
          }
          if (data) {
            // Ensure data is not null before considering it a successful fetch
            // console.log(`CartProvider: retryFetchCart - Cart data changed/fetched on attempt ${retries + 1}, updating state.`);
            success = true
            return data
          }
          // console.log(`CartProvider: retryFetchCart - Empty/null cart data on attempt ${retries + 1}`);
          return currentCart // Keep current cart if new data is null and current isn't
        })
        if (success) setError(null)
      } catch (err) {
        console.error(`CartProvider: Error fetching cart on attempt ${retries + 1}:`, err)
        // Don't set global error on retry, let it fail if all retries exhausted
      }
      if (!success) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (retries + 1))) // Exponential backoff
        retries++
      }
    }

    if (!success) {
      console.error('CartProvider: Failed to fetch cart after multiple attempts')
      // setError(new Error('Failed to load cart. Please try again.')); // Optionally set a final error
    }
    setIsLoading(false)
  }, []) // Removed cart from dependencies

  // Fetch cart on mount and when auth state changes
  useEffect(() => {
    // console.log('CartProvider: Auth state changed or component mounted. isAuthenticated:', isAuthenticated);
    fetchCart()
  }, [fetchCart, isAuthenticated])

  const memoizedItems = useMemo(() => cart?.items ?? [], [cart?.items])

  const itemCount = useMemo(() => {
    return memoizedItems.reduce((count, item) => count + (item.quantity || 1), 0)
  }, [memoizedItems])

  const total = useMemo(() => {
    return memoizedItems.reduce((sum, item) => {
      const price = item.priceSnapshot || 0
      return sum + price * (item.quantity || 1)
    }, 0)
  }, [memoizedItems])

  // NEW: Вспомогательные функции для оптимистичного обновления

  // Функция для локального обновления состояния корзины
  const updateLocalCart = useCallback(
    (updatedItems: CartItem[]): void => {
      if (cart) {
        const updatedCart = {
          ...cart,
          items: updatedItems,
        }
        setCart(updatedCart)
      }
    },
    [cart],
  )

  // Функция для создания ключа загрузки элемента
  const getItemLoadingKey = useCallback((itemId: string, itemType: CartItemType): string => {
    return `${itemType}-${itemId}`
  }, [])

  // Получаем ID элемента в зависимости от типа
  const getItemId = useCallback((item: CartItem): string | null => {
    try {
      if (item.itemType === 'product' && item.product) {
        return typeof item.product === 'string' ? item.product : item.product?.id || null
      } else if (item.itemType === 'service' && item.service) {
        return typeof item.service === 'string' ? item.service : item.service?.id || null
      }
      return null
    } catch (err) {
      console.error('Error in getItemId:', err)
      return null
    }
  }, [])

  // Локальное обновление количества элемента
  const updateItemQuantityLocally = useCallback(
    (itemId: string, itemType: CartItemType, quantity: number): boolean => {
      if (!cart || !cart.items) return false

      const updatedItems = [...cart.items]
      const itemIndex = updatedItems.findIndex((item) => {
        if (item.itemType === itemType) {
          const currentItemId =
            itemType === 'product'
              ? typeof item.product === 'string'
                ? item.product
                : item.product?.id
              : typeof item.service === 'string'
                ? item.service
                : item.service?.id
          return currentItemId === itemId
        }
        return false
      })

      if (itemIndex === -1) return false

      // Полностью типизированная версия
      const currentItem = updatedItems[itemIndex]
      if (currentItem && currentItem.itemType === 'product') {
        updatedItems[itemIndex] = {
          ...currentItem,
          quantity: quantity,
        } as CartProductItem
      } else if (currentItem) {
        updatedItems[itemIndex] = {
          ...currentItem,
          quantity: quantity,
        } as CartServiceItem
      }

      updateLocalCart(updatedItems as CartItem[])
      return true
    },
    [cart, updateLocalCart],
  )

  // Локальное удаление элемента
  const removeItemLocally = useCallback(
    (itemId: string, itemType: CartItemType): boolean => {
      if (!cart || !cart.items) return false

      // Сначала проверяем, есть ли такой элемент
      const exists = cart.items.some((item) => {
        if (item.itemType === itemType) {
          const currentItemId =
            itemType === 'product'
              ? typeof item.product === 'string'
                ? item.product
                : item.product?.id
              : typeof item.service === 'string'
                ? item.service
                : item.service?.id
          return currentItemId === itemId
        }
        return false
      })

      if (!exists) return false

      // Фильтруем с правильной типизацией
      const updatedItems = cart.items
        .filter((item) => {
          if (item.itemType === itemType) {
            const currentItemId =
              itemType === 'product'
                ? typeof item.product === 'string'
                  ? item.product
                  : item.product?.id
                : typeof item.service === 'string'
                  ? item.service
                  : item.service?.id
            return currentItemId !== itemId
          }
          return true
        })
        .map((item) => item) // Простая копия для сохранения типа

      updateLocalCart(updatedItems as CartItem[])
      return true
    },
    [cart, updateLocalCart],
  )

  // Update item quantity - обновляем с оптимистичным обновлением UI
  const updateItem = useCallback(
    async (itemId: string, itemType: CartItemType, quantity: number): Promise<void> => {
      const loadingKey = getItemLoadingKey(itemId, itemType)
      try {
        // Оптимистичное обновление UI
        const success = updateItemQuantityLocally(itemId, itemType, quantity)
        if (!success) {
          console.warn('Item not found in local cart for optimistic update')
        }

        // Устанавливаем состояние загрузки для конкретного товара
        setItemsLoading((prev) => ({ ...prev, [loadingKey]: true }))

        // Если количество 0 или меньше, удаляем товар из корзины через API (без вызова removeItem)
        if (quantity <= 0) {
          await removeFromCart(itemId, itemType)
          // Получаем обновленную корзину
          const updatedCart = await getCart()
          if (updatedCart) {
            setCart(updatedCart)
          }
          return
        }

        await updateCartItemQuantity(itemId, itemType, quantity)

        // Fetch and conditionally set cart
        const newCartData = await getCart()
        setCart((currentCart) =>
          areCartDataEqual(currentCart, newCartData) ? currentCart : newCartData,
        )
      } catch (err) {
        console.error('Error updating cart item:', err)

        // В случае ошибки возвращаем исходные данные
        await fetchCart()

        toast({
          title: 'Error updating item',
          description: err instanceof Error ? err.message : 'Failed to update item',
          variant: 'destructive',
        })
        throw err
      } finally {
        // Убираем состояние загрузки для товара
        setItemsLoading((prev) => ({ ...prev, [loadingKey]: false }))
      }
    },
    [fetchCart, getItemLoadingKey, updateItemQuantityLocally],
  )

  // Remove item from cart - обновляем с оптимистичным обновлением UI
  const removeItem = useCallback(
    async (itemId: string, itemType: CartItemType = 'product'): Promise<void> => {
      const loadingKey = getItemLoadingKey(itemId, itemType)
      try {
        // Оптимистичное обновление UI
        const success = removeItemLocally(itemId, itemType)
        if (!success) {
          console.warn('Item not found in local cart for removal')
        }

        // Устанавливаем состояние загрузки для конкретного товара
        setItemsLoading((prev) => ({ ...prev, [loadingKey]: true }))

        await removeFromCart(itemId, itemType)

        // Fetch and conditionally set cart
        const newCartData = await getCart()
        setCart((currentCart) =>
          areCartDataEqual(currentCart, newCartData) ? currentCart : newCartData,
        )
      } catch (err) {
        console.error('Error removing cart item:', err)

        // В случае ошибки возвращаем исходные данные
        await fetchCart()

        toast({
          title: 'Error removing item',
          description: err instanceof Error ? err.message : 'Failed to remove item',
          variant: 'destructive',
        })
        throw err
      } finally {
        // Убираем состояние загрузки для товара
        setItemsLoading((prev) => ({ ...prev, [loadingKey]: false }))
      }
    },
    [fetchCart, getItemLoadingKey, removeItemLocally],
  )

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

  // Создаем дебаунсированную версию updateItem для предотвращения частых запросов
  const debouncedUpdateItem = useMemo(
    () =>
      debounce(async (itemId: string, itemType: CartItemType, quantity: number): Promise<void> => {
        await updateItem(itemId, itemType, quantity)
      }, 500),
    [updateItem],
  )

  // Empty cart
  const emptyCart = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)

      // Оптимистичное обновление UI
      if (cart) {
        setCart({
          ...cart,
          items: [],
        })
      }

      await clearCart()

      // Обновляем корзину для синхронизации
      await fetchCart()
    } catch (err) {
      console.error('Error clearing cart:', err)

      // В случае ошибки возвращаем исходные данные
      await fetchCart()

      toast({
        title: 'Error clearing cart',
        description: err instanceof Error ? err.message : 'Failed to clear cart',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [cart, fetchCart])

  const openCartModal = useCallback(() => setIsCartModalOpen(true), [])
  const closeCartModal = useCallback(() => setIsCartModalOpen(false), [])
  const toggleCartModal = useCallback(() => setIsCartModalOpen((prev) => !prev), [])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      cart,
      items: memoizedItems,
      itemCount,
      total,
      isLoading,
      error,
      itemsLoading,
      isCartModalOpen,
      openCartModal,
      closeCartModal,
      toggleCartModal,
      addItem,
      updateItem: debouncedUpdateItem,
      removeItem,
      emptyCart,
      refreshCart: fetchCart,
      // Алиасы для обратной совместимости
      add: addItem,
      clear: emptyCart,
      remove: removeItem,
    }),
    [
      cart, // cart object reference
      memoizedItems, // stable items array reference if content is same
      itemCount, // derived from memoizedItems
      total, // derived from memoizedItems
      isLoading,
      error,
      itemsLoading,
      isCartModalOpen,
      openCartModal,
      closeCartModal,
      toggleCartModal,
      addItem,
      debouncedUpdateItem,
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
