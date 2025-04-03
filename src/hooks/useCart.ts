'use client'

import useSWR, { mutate, MutatorOptions } from 'swr'
import { CartSession, Product } from '@/payload-types'
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '@/utilities/api'
import { useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Locale } from '@/constants' // Предполагаем, что Locale импортируется

// Ключ для SWR
export const CART_KEY = '/api/cart'

// Тип возвращаемого значения хука
interface UseCartReturn {
  cart: CartSession | null | undefined // undefined во время загрузки, null если корзины нет
  items: CartSession['items'] // Удобный доступ к товарам
  itemCount: number
  total: number
  isLoading: boolean
  error: any
  add: (productId: string, quantity?: number) => Promise<void>
  update: (productId: string, quantity: number) => Promise<void>
  remove: (productId: string) => Promise<void>
  clear: () => Promise<void>
  mutateCart: (
    data?: CartSession | Promise<CartSession | null> | null,
    opts?: boolean | MutatorOptions<CartSession | null>,
  ) => Promise<CartSession | null | undefined> // Функция ревалидации
}

export const useCart = (locale: Locale = 'en'): UseCartReturn => {
  // Принимаем locale для расчета total
  // Используем SWR для получения корзины
  const {
    data: cart,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<CartSession | null>(
    CART_KEY,
    getCart, // Функция для запроса данных
    {
      fallbackData: null, // Начальное значение - null (нет корзины)
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onError: (err) => {
        console.error('SWR Cart Error:', err)
        // Не показываем тост, т.к. может быть 404 (нет корзины) или 401 (не авторизован)
      },
    },
  )

  // --- Функции-обертки для изменения корзины ---

  // Обобщенная функция для оптимистичного обновления
  const performCartUpdate = useCallback(
    async (
      action: () => Promise<CartSession | void | null>, // API вызов
      optimisticDataGenerator: (currentCart: CartSession | null) => CartSession | null, // Функция для генерации оптимистичных данных
      successMessage: string,
      errorMessage: string,
    ) => {
      // Генерируем оптимистичное состояние
      const optimisticCart = optimisticDataGenerator(cart ?? null)

      // Выполняем оптимистичное обновление
      await mutate(CART_KEY, optimisticCart, {
        optimisticData: optimisticCart,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false, // Не перезапрашиваем сразу
      })

      try {
        await action() // Выполняем реальный API запрос
        // toast({ title: successMessage });
        // Опционально ревалидируем после успешного запроса, чтобы убедиться в консистентности
        // Хотя обычно не требуется, если API возвращает актуальное состояние
        // await revalidate();
      } catch (err: any) {
        console.error(`${errorMessage}:`, err)
        toast({
          title: errorMessage,
          description: err.message || 'Please try again.',
          variant: 'destructive',
        })
        // SWR автоматически откатит изменения
      }
    },
    [cart, revalidate],
  )

  // Добавление товара
  const add = useCallback(
    async (productId: string, quantity: number = 1) => {
      await performCartUpdate(
        () => addToCart(productId, quantity),
        (currentCart) => {
          // Логика генерации оптимистичного состояния для добавления
          const newCart = structuredClone(
            currentCart ?? {
              id: 'optimistic',
              items: [],
      itemCount: 0,
              total: 0,
              sessionId: 'optimistic',
            },
          )
          if (!newCart.items) newCart.items = []

          const existingIndex = newCart.items.findIndex(
            (item) =>
              (typeof item.product === 'string' ? item.product : item.product?.id) === productId,
          )

          // Нужна информация о продукте (хотя бы цена) для оптимистичного обновления
          // Это ограничение - откуда взять цену продукта на клиенте перед добавлением?
          // Возможно, ProductCard должен передавать продукт целиком, или цена должна быть передана в add
          // Пока что добавим без цены или с ценой 0 для примера
          const TEMP_PRICE = 0 // ЗАГЛУШКА!

          if (existingIndex > -1) {
            newCart.items[existingIndex].quantity += quantity
            newCart.items[existingIndex].price = TEMP_PRICE // Обновляем цену
          } else {
            newCart.items.push({ product: productId, quantity, price: TEMP_PRICE })
          }
          // Пересчитываем itemCount и total (оптимистично)
          newCart.itemCount = newCart.items.reduce((sum, i) => sum + i.quantity, 0)
          newCart.total = newCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
          return newCart
        },
        'Item added to cart',
        'Failed to add item',
      )
    },
    [performCartUpdate],
  )

  // Обновление количества
  const update = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 0) {
        console.warn('Attempted to update with negative quantity. Use remove instead.')
        return // Не допускаем отрицательное количество
      }
      if (quantity === 0) {
        console.warn('Attempted to update with quantity 0. Use remove instead.')
        // Можно либо ничего не делать, либо все же удалить, но лучше пусть компонент решает
        return
      }

      await performCartUpdate(
        () => updateCartItemQuantity(productId, quantity),
        (currentCart) => {
          // Логика генерации оптимистичного состояния для обновления
          if (!currentCart?.items) return currentCart
          const newCart = structuredClone(currentCart)
          const itemIndex = newCart.items.findIndex(
            (item) =>
              (typeof item.product === 'string' ? item.product : item.product?.id) === productId,
          )
          if (itemIndex > -1) {
            newCart.items[itemIndex].quantity = quantity
          }
          // Пересчитываем itemCount и total
          newCart.itemCount = newCart.items.reduce((sum, i) => sum + i.quantity, 0)
          newCart.total = newCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
          return newCart
        },
        'Cart quantity updated',
        'Failed to update quantity',
      )
    },
    [performCartUpdate],
  )

  // Удаление товара
  const remove = useCallback(
    async (productId: string) => {
      await performCartUpdate(
        () => removeFromCart(productId),
        (currentCart) => {
          // Логика генерации оптимистичного состояния для удаления
          if (!currentCart?.items) return currentCart
          const newCart = structuredClone(currentCart)
          newCart.items = newCart.items.filter(
            (item) =>
              (typeof item.product === 'string' ? item.product : item.product?.id) !== productId,
          )
          // Пересчитываем itemCount и total
          newCart.itemCount = newCart.items.reduce((sum, i) => sum + i.quantity, 0)
          newCart.total = newCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
          return newCart
        },
        'Item removed from cart',
        'Failed to remove item',
      )
    },
    [performCartUpdate],
  )

  // Очистка корзины
  const clear = useCallback(async () => {
    await performCartUpdate(
      clearCart,
      (currentCart) => {
        // Оптимистично возвращаем пустую корзину (или null)
        if (!currentCart) return null
        return { ...currentCart, items: [], itemCount: 0, total: 0 }
      },
      'Cart cleared',
      'Failed to clear cart',
    )
  }, [performCartUpdate])

  // Рассчитываем itemCount и total на основе данных SWR
  // Используем locale для корректного расчета total, если цены локализованы
  // Примечание: total рассчитывается на клиенте, серверный total используется как fallback
  const items = cart?.items ?? []
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const total = items.reduce((sum, item) => {
    // Пытаемся получить цену из загруженного продукта (если depth=1)
    const product = (typeof item.product === 'object' ? item.product : null) as Product | null
    // Нужна функция для получения цены с учетом локали
    // const price = getLocalePrice(product, locale, item.price); // Используем item.price как fallback
    const price = item.price // Пока используем цену, сохраненную в корзине
    return sum + (price || 0) * item.quantity
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
