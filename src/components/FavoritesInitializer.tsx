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

  // Ручная гидратация при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      try {
        const storedFavorites = localStorage.getItem('product-favorites')

        if (storedFavorites) {
          const parsed = JSON.parse(storedFavorites)
          const { state } = parsed

          // Восстанавливаем избранные товары
          if (state?.favorites?.length) {
            // Сначала очищаем текущие избранные
            clearFavorites()

            // Добавляем каждый товар из сохраненного списка
            state.favorites.forEach((product: any) => {
              if (product && product.id) {
                addToFavorites(product)
              }
            })
          }

          // Восстанавливаем локаль, если она есть
          if (state?.locale) {
            setLocale(state.locale)
          }
        }

        setIsHydrated(true)

        // После завершения гидратации, вызываем forceUpdate через таймаут
        // чтобы позволить состоянию обновиться
        setTimeout(() => {
          forceUpdate()
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

    // Дополнительное обновление чтобы гарантировать правильное отображение
    setTimeout(() => {
      forceUpdate()
    }, 500)

    // Настраиваем интервал для периодического сохранения
    const interval = setInterval(() => {
      persistState()
    }, 5000) // Каждые 5 секунд

    // Также добавляем проверку изменения localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'product-favorites' && e.newValue !== null) {
        // Если localStorage изменился из другой вкладки, обновляем состояние
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.state?.favorites) {
            // Форсируем обновление чтобы синхронизировать состояние
            setTimeout(() => forceUpdate(), 0)
          }
        } catch (error) {
          console.error('[Favorites] Error parsing storage event data:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [persistState, isHydrated, forceUpdate])

  return <>{children}</>
}
