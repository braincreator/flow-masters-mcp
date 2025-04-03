'use client'

import useSWR from 'swr'
import { mutate } from 'swr' // Импортируем глобальный mutate
import { getFavorites, toggleFavorite } from '@/utilities/api' // Импортируем API функции
import { useCallback } from 'react'
import { toast } from '@/components/ui/use-toast' // Для уведомлений

// Ключ для SWR - используем кастомный эндпоинт
const FAVORITES_KEY = '/api/favorites'

// Тип данных, возвращаемых хуком
interface UseFavoritesReturn {
  favoriteProductIds: Set<string> | undefined
  isLoading: boolean
  error: any
  isFavorite: (productId: string) => boolean
  toggle: (productId: string) => Promise<void>
  mutateFavorites: () => Promise<string[] | undefined> // Для ручного обновления
}

export const useFavorites = (): UseFavoritesReturn => {
  // Используем SWR для получения списка ID избранных продуктов
  // fetcher теперь - это наша API функция getFavorites
  const {
    data: favoriteIds,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<string[]>(
    FAVORITES_KEY, // Используем правильный ключ/эндпоинт
    getFavorites, // Эта функция будет изменена для вызова FAVORITES_KEY
    {
      fallbackData: [], // Начальное значение - пустой массив
      revalidateOnFocus: true, // Обновлять при фокусе окна
      revalidateOnReconnect: true, // Обновлять при переподключении
      // Можно добавить onError для глобальной обработки ошибок
      onError: (err) => {
        console.error('SWR Favorites Error:', err)
        // Не показываем тост на ошибку загрузки, т.к. она может быть при отсутствии авторизации
        // toast({ title: 'Error loading favorites', description: err.message, variant: 'destructive' })
      },
    },
  )

  // Преобразуем массив ID в Set для быстрого доступа O(1)
  const favoriteProductIds = favoriteIds ? new Set(favoriteIds) : undefined

  // Функция для проверки, находится ли товар в избранном
  const isFavorite = useCallback(
    (productId: string): boolean => {
      return !!favoriteProductIds?.has(productId)
    },
    [favoriteProductIds],
  )

  // Функция для добавления/удаления товара из избранного
  const toggle = useCallback(
    async (productId: string) => {
      if (!favoriteProductIds) {
        toast({
          title: 'Cannot update favorites',
          description: 'Favorites data is not loaded yet.',
          variant: 'warning',
        })
        return
      }

      const currentIsFavorite = favoriteProductIds.has(productId)
      const optimisticNewState = new Set(favoriteProductIds)
      if (currentIsFavorite) {
        optimisticNewState.delete(productId)
      } else {
        optimisticNewState.add(productId)
      }

      // Оптимистичное обновление UI с помощью SWR mutate
      // Первый аргумент - ключ, второй - новые данные (или функция обновления),
      // Третий - опции (revalidate: false - не перезапрашивать сразу)
      await mutate(FAVORITES_KEY, Array.from(optimisticNewState), {
        optimisticData: Array.from(optimisticNewState),
        rollbackOnError: true, // Автоматически откатывать при ошибке
        populateCache: true, // Обновить кэш немедленно
        revalidate: false, // Не делать запрос после мутации (мы сделаем его вручную если нужно)
      })

      try {
        // Отправляем запрос на сервер
        const result = await toggleFavorite(productId)
        // Сервер возвращает { isFavorite: boolean }
        // Можно добавить проверку, совпадает ли результат с оптимистичным обновлением

        // Опционально: Показать сообщение об успехе
        // toast({ title: currentIsFavorite ? 'Removed from favorites' : 'Added to favorites' })

        // Можно триггернуть revalidation, если нужно быть 100% уверенным в данных,
        // но обычно при успешном toggle это не требуется
        // await revalidate()
      } catch (err: any) {
        console.error('Failed to toggle favorite:', err)
        toast({
          title: 'Failed to update favorites',
          description: err.message || 'Please try again.',
          variant: 'destructive',
        })
        // SWR автоматически откатит состояние благодаря rollbackOnError: true
      }
    },
    [favoriteProductIds, revalidate],
  )

  return {
    favoriteProductIds,
    isLoading,
    error,
    isFavorite,
    toggle,
    mutateFavorites: revalidate, // Предоставляем функцию для ручной ревалидации
  }
}
