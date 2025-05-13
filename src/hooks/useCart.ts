'use client'

import useSWR, { mutate, MutatorOptions } from 'swr'
import { CartSession, Product, Service } from '@/payload-types'
import {
  getCart,
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart,
} from '@/utilities/api'
import { useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Locale } from '@/constants'

export const CART_KEY = '/api/cart'

interface UseCartReturn {
  cart: CartSession | null | undefined
  items: CartSession['items']
  itemCount: number
  total: number
  isLoading: boolean
  error: any
  add: (
    itemId: string,
    itemType: 'product' | 'service',
    quantity?: number,
  ) => Promise<void>
  update: (itemId: string, itemType: 'product' | 'service', quantity: number) => Promise<void>
  remove: (itemId: string, itemType: 'product' | 'service') => Promise<void>
  clear: () => Promise<void>
  mutateCart: (
    data?: CartSession | Promise<CartSession | null> | null,
    opts?: boolean | MutatorOptions<CartSession | null>,
  ) => Promise<CartSession | null | undefined>
}

export const useCart = (locale: Locale = 'en'): UseCartReturn => {
  type CartItem = NonNullable<CartSession['items']>[0];

  const {
    data: cart,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<CartSession | null>(
    CART_KEY,
    getCart,
    {
      fallbackData: null,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onError: (err) => {
        console.error('SWR Cart Error:', err)
      },
    },
  )

  const performCartUpdate = useCallback(
    async (
      action: () => Promise<CartSession | void | null>,
      optimisticDataGenerator: (currentCart: CartSession | null) => CartSession | null,
      successMessage: string,
      errorMessage: string,
    ) => {
      const optimisticCart = optimisticDataGenerator(cart ?? null)
      await mutate(CART_KEY, optimisticCart, {
        optimisticData: optimisticCart,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      })
      try {
        await action()
      } catch (err: any) {
        console.error(`${errorMessage}:`, err)
        toast({
          title: errorMessage,
          description: err.message || 'Please try again.',
          variant: 'destructive',
        })
      }
    },
    [cart, revalidate],
  )

  const remove = useCallback(
    async (itemId: string, itemType: 'product' | 'service') => {
      await performCartUpdate(
        () => removeFromCart(itemId, itemType),
        (currentCart): CartSession | null => {
          if (!currentCart) return null;
          const newCart = structuredClone(currentCart);
          if (!newCart.items) {
            newCart.items = [] as NonNullable<CartSession['items']>;
          } else {
            newCart.items = newCart.items.filter(
              (item) =>
                !(
                  item.itemType === itemType &&
                  (itemType === 'product'
                    ? (typeof item.product === 'string' ? item.product : item.product?.id) === itemId
                    : (typeof item.service === 'string' ? item.service : item.service?.id) === itemId)
                ),
            );
          }
          newCart.itemCount = (newCart.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
          newCart.total = (newCart.items || []).reduce((sum, i: CartItem) => sum + (i.priceSnapshot || 0) * (i.quantity || 0), 0);
          return newCart;
        },
        'Item removed from cart',
        'Failed to remove item',
      )
    },
    [performCartUpdate],
  )

  const add = useCallback(
    async (itemId: string, itemType: 'product' | 'service', quantity: number = 1) => {
      await performCartUpdate(
        () => addToCart(itemId, itemType, quantity),
        (currentCart): CartSession | null => { 
          const newCart = structuredClone(
            currentCart ?? {
              id: 'optimistic-cart',
              items: [] as NonNullable<CartSession['items']>, 
              itemCount: 0,
              total: 0,
              sessionId: 'optimistic-session', 
              currency: 'USD', 
              updatedAt: new Date().toISOString(), 
              createdAt: new Date().toISOString(),
              reminderSent: false,
              convertedToOrder: false, 
            },
          )
          if (!newCart.items) { 
            newCart.items = [] as NonNullable<CartSession['items']>;
          }

          const existingIndex = newCart.items.findIndex(
            (item) =>
              item.itemType === itemType &&
              (itemType === 'product'
                ? (typeof item.product === 'string' ? item.product : item.product?.id) === itemId
                : (typeof item.service === 'string' ? item.service : item.service?.id) === itemId),
          )

          const TEMP_PRICE = 0 

          if (existingIndex > -1) {
            if (newCart.items && newCart.items[existingIndex]) { 
              newCart.items[existingIndex].quantity += quantity
            }
          } else {
            const newItem: CartItem = {
              itemType,
              quantity,
              priceSnapshot: TEMP_PRICE,
            };
            if (itemType === 'product') {
              newItem.product = itemId as any; 
            } else {
              newItem.service = itemId as any;
            }
            newCart.items.push(newItem);
          }
          newCart.itemCount = newCart.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
          newCart.total = newCart.items.reduce((sum, i: CartItem) => sum + (i.priceSnapshot || 0) * (i.quantity || 0), 0);
          return newCart;
        },
        'Item added to cart',
        'Failed to add item',
      )
    },
    [performCartUpdate],
  )
  
  const update = useCallback(
    async (itemId: string, itemType: 'product' | 'service', quantity: number) => {
      if (quantity < 0) {
        console.warn('Attempted to update with negative quantity. Use remove instead.')
        return
      }
      if (quantity === 0) {
        await remove(itemId, itemType) 
        return
      }
      await performCartUpdate(
        () => updateCartItemQuantity(itemId, itemType, quantity),
        (currentCart): CartSession | null => {
          if (!currentCart) return null;
          const newCart = structuredClone(currentCart);
          if (!newCart.items) newCart.items = [] as NonNullable<CartSession['items']>;

          const itemIndex = newCart.items.findIndex(
            (item) =>
              item.itemType === itemType &&
              (itemType === 'product'
                ? (typeof item.product === 'string' ? item.product : item.product?.id) === itemId
                : (typeof item.service === 'string' ? item.service : item.service?.id) === itemId),
          );
          if (itemIndex > -1 && newCart.items && newCart.items[itemIndex]) { 
            newCart.items[itemIndex].quantity = quantity;
          }
          newCart.itemCount = (newCart.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
          newCart.total = (newCart.items || []).reduce((sum, i: CartItem) => sum + (i.priceSnapshot || 0) * (i.quantity || 0), 0);
          return newCart;
        },
        'Cart quantity updated',
        'Failed to update quantity',
      )
    },
    [performCartUpdate, remove], 
  )

  const clear = useCallback(async () => {
    await performCartUpdate(
      clearCart,
      (currentCart) => {
        if (!currentCart) return null
        return { ...currentCart, items: [], itemCount: 0, total: 0 }
      },
      'Cart cleared',
      'Failed to clear cart',
    )
  }, [performCartUpdate])

  const items = cart?.items ?? []
  const itemCount = items.reduce((count, item) => count + (item.quantity || 0), 0)
  const total = items.reduce((sum, item: CartItem) => {
    const price = item.priceSnapshot
    return sum + (price || 0) * (item.quantity || 0)
  }, 0)

  return {
    cart,
    items,
    itemCount,
    total,
    isLoading,
    error,
    add,
    update,
    remove,
    clear,
    mutateCart: revalidate,
  }
}
