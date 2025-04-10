'use client'

import useSWR from 'swr'
import { mutate } from 'swr' // Импортируем глобальный mutate
import { getFavorites, toggleFavorite } from '@/utilities/api' // Импортируем API функции
import { useCallback, useEffect } from 'react'
import { toast } from '@/components/ui/use-toast' // Для уведомлений
import { useAuth } from '@/hooks/useAuth'

// Ключ для localStorage
const LOCAL_FAVORITES_KEY = 'local_favorites'
// Ключ для SWR
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
  const { user, isLoading: isLoadingAuth, isAuthenticated } = useAuth()

  // Функция для получения избранного с учетом локального хранилища
  const fetchFavorites = async () => {
    // Если пользователь авторизован, получаем избранное с сервера
    if (isAuthenticated && user) {
      return getFavorites()
    }

    // Для неавторизованных пользователей используем localStorage
    try {
      const localFavorites = localStorage.getItem(LOCAL_FAVORITES_KEY)
      return localFavorites ? JSON.parse(localFavorites) : []
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error)
      return []
    }
  }

  // Используем SWR для получения списка ID избранных продуктов
  // fetcher теперь - это наша API функция getFavorites
  const {
    data: favoriteIds,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<string[]>(
    FAVORITES_KEY, // Используем правильный ключ/эндпоинт
    fetchFavorites, // Эта функция будет изменена для вызова FAVORITES_KEY
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

  // Синхронизация с localStorage при изменении избранного
  useEffect(() => {
    if (!isAuthenticated && favoriteIds) {
      try {
        localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favoriteIds))
      } catch (error) {
        console.error('Failed to save favorites to localStorage:', error)
      }
    }
  }, [favoriteIds, isAuthenticated])

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

      // Оптимистичное обновление UI
      await mutate(FAVORITES_KEY, Array.from(optimisticNewState), {
        optimisticData: Array.from(optimisticNewState),
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      })

      try {
        // Если пользователь авторизован, отправляем запрос на сервер
        if (isAuthenticated && user) {
          await toggleFavorite(productId)
        } else {
          // Для неавторизованных пользователей сохраняем в localStorage
          localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(Array.from(optimisticNewState)))
        }
      } catch (err: any) {
        console.error('Failed to toggle favorite:', err)
        toast({
          title: 'Failed to update favorites',
          description: err.message || 'Please try again.',
          variant: 'destructive',
        })
      }
    },
    [favoriteProductIds, isAuthenticated, user, revalidate],
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
