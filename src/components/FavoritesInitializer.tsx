'use client'

import { useEffect, ReactNode, useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { Locale } from '@/constants'

interface FavoritesInitializerProps {
  children: ReactNode
  locale: Locale
}

export default function FavoritesInitializer({ children, locale }: FavoritesInitializerProps) {
  const { addToFavorites, clearFavorites, persistState, favorites, setLocale, forceUpdate } =
    useFavorites()
  const [isHydrated, setIsHydrated] = useState(false)

  // Отслеживание изменений в избранном
  useEffect(() => {
    if (isHydrated && process.env.NODE_ENV === 'development') {
      console.log('[Favorites] Current favorites count:', favorites.length, 'Locale:', locale)
    }
  }, [favorites, isHydrated, locale])

  // Ручная гидратация при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      try {
        const storedFavorites = localStorage.getItem('product-favorites')

        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites)
          const { state } = parsed

          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[Favorites] Found stored data:',
              storedFavorites ? 'Yes' : 'No',
              'Version:',
              parsed.version || 'unknown',
              'Items:',
              state?.favorites?.length || 0,
              'Locale:',
              state?.locale || 'not set',
            )
          }

          // Восстанавливаем избранные товары
          if (state?.favorites?.length) {
            // Сначала очищаем текущие избранные
            clearFavorites()

            // Добавляем каждый товар из сохраненного списка
            let added = 0
            state.favorites.forEach((product: any) => {
              if (product && product.id) {
                addToFavorites(product)
                added++
              }
            })

            if (process.env.NODE_ENV === 'development') {
              console.log('[Favorites] Hydrated successfully, added', added, 'items')
            }
          }

          // Восстанавливаем локаль, если она есть
          if (state?.locale) {
            setLocale(state.locale)
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.log('[Favorites] No stored data found in localStorage')
        }

        setIsHydrated(true)

        // После завершения гидратации, вызываем forceUpdate через таймаут
        // чтобы позволить состоянию обновиться
        setTimeout(() => {
          forceUpdate()
          if (process.env.NODE_ENV === 'development') {
            console.log('[Favorites] Forced update after hydration')
          }
        }, 100)
      } catch (error) {
        console.error('[Favorites] Error hydrating from localStorage:', error)
        setIsHydrated(true) // Помечаем как гидратированный даже при ошибке, чтобы избежать бесконечных повторений
      }
    }
  }, [isHydrated, addToFavorites, clearFavorites, setLocale, forceUpdate])

  // Обновляем локаль когда она изменяется (после гидратации)
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      setLocale(locale)

      // При изменении локали также обновляем состояние
      setTimeout(() => forceUpdate(), 50)
    }
  }, [locale, setLocale, isHydrated, forceUpdate])

  // Force save favorites state on page unload
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeUnload = () => {
      try {
        // Manually save current favorites state
        const currentState = {
          favorites: favorites,
          locale: locale, // Сохраняем текущую локаль
        }

        const storageContent = JSON.stringify({
          state: currentState,
          version: 1,
        })

        localStorage.setItem('product-favorites', storageContent)

        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[Favorites] Saved on page unload:',
            favorites.length,
            'items, size:',
            Math.round(storageContent.length / 1024),
            'KB',
          )
        }
      } catch (error) {
        console.error('[Favorites] Error saving to localStorage on unload:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [favorites, locale])

  // Периодически сохраняем состояние избранных товаров
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return

    // Немедленное сохранение при гидратации
    persistState()

    // Настраиваем интервал для периодического сохранения
    const interval = setInterval(() => {
      persistState()
    }, 5000) // Каждые 5 секунд

    return () => {
      clearInterval(interval)
    }
  }, [persistState, isHydrated])

  // Периодически проверяем и обновляем состояние избранного (только в режиме разработки)
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated || process.env.NODE_ENV !== 'development')
      return

    // Каждые 2 секунды проверяем состояние localStorage и обновляем UI если нужно
    const interval = setInterval(() => {
      try {
        const storedFavorites = localStorage.getItem('product-favorites')
        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites)
          if (parsed?.state?.favorites?.length > 0 && favorites.length === 0) {
            console.log(
              '[Favorites] Detected mismatch between store and localStorage, forcing update',
            )
            forceUpdate()
          }
        }
      } catch (error) {
        console.error('[Favorites] Error checking localStorage:', error)
      }
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [isHydrated, favorites.length, forceUpdate])

  return <>{children}</>
}
