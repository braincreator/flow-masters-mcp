'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/payload-types'
import { Locale } from '@/constants'

interface FavoritesStore {
  favorites: Product[]
  locale: Locale
  addToFavorites: (product: Product) => void
  removeFromFavorites: (productId: string) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
  setLocale: (locale: Locale) => void
  count: number
  // Ручное сохранение состояния
  persistState: () => void
  // Функция для принудительного обновления состояния после гидратации
  forceUpdate: () => void
}

// Создаем адаптер хранилища с поддержкой отладки и обработкой ошибок
const createCustomStorage = () => {
  const storageKey = 'product-favorites'

  return {
    getItem: (name: string): string => {
      if (typeof window === 'undefined') return ''

      try {
        const item = localStorage.getItem(name)
        return item || ''
      } catch (error) {
        console.error(`[Storage] Error getting ${name} from localStorage:`, error)
        return ''
      }
    },

    setItem: (name: string, value: string): void => {
      if (typeof window === 'undefined') return

      try {
        localStorage.setItem(name, value)
      } catch (error) {
        console.error(`[Storage] Error setting ${name} in localStorage:`, error)
      }
    },

    removeItem: (name: string): void => {
      if (typeof window === 'undefined') return

      try {
        localStorage.removeItem(name)
      } catch (error) {
        console.error(`[Storage] Error removing ${name} from localStorage:`, error)
      }
    },
  }
}

// Функция для ручного сохранения состояния
const manualPersist = (state: any) => {
  if (typeof window === 'undefined') return

  try {
    const stateToStore = {
      favorites: state.favorites,
      locale: state.locale,
    }

    const storageContent = JSON.stringify({
      state: stateToStore,
      version: 1,
    })

    localStorage.setItem('product-favorites', storageContent)
  } catch (error) {
    console.error('[Favorites] Error manually persisting favorites state:', error)
  }
}

// Первоначальная загрузка состояния из localStorage для SSR
const getInitialState = (): { favorites: Product[]; locale: Locale } => {
  if (typeof window === 'undefined') {
    return { favorites: [], locale: 'en' }
  }

  try {
    const storedData = localStorage.getItem('product-favorites')
    if (storedData) {
      const parsed = JSON.parse(storedData)
      if (parsed.state) {
        return {
          favorites: Array.isArray(parsed.state.favorites) ? parsed.state.favorites : [],
          locale: parsed.state.locale || 'en',
        }
      }
    }
  } catch (error) {
    console.error('[Favorites] Error reading initial state:', error)
  }

  return { favorites: [], locale: 'en' }
}

const initialState = getInitialState()

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: initialState.favorites,
      locale: initialState.locale,

      addToFavorites: (product) =>
        set((state) => {
          if (!product?.id) return state

          // Check if product is already in favorites
          if (state.favorites.some((favorite) => favorite.id === product.id)) {
            return state
          }

          const newState = {
            favorites: [...state.favorites, product],
          }

          // Ручное сохранение после обновления состояния
          setTimeout(() => manualPersist({ ...get() }), 0)

          return newState
        }),

      removeFromFavorites: (productId) =>
        set((state) => {
          const newState = {
            favorites: state.favorites.filter((product) => product.id !== productId),
          }

          // Ручное сохранение после обновления состояния
          setTimeout(() => manualPersist({ ...get() }), 0)

          return newState
        }),

      isFavorite: (productId) => {
        return get().favorites.some((product) => product.id === productId)
      },

      clearFavorites: () => {
        set({ favorites: [] })

        // Ручное сохранение после обновления состояния
        setTimeout(() => manualPersist({ ...get() }), 0)
      },

      setLocale: (locale) => {
        set({ locale })

        // Ручное сохранение после обновления состояния
        setTimeout(() => manualPersist({ ...get() }), 0)
      },

      get count() {
        return get().favorites.length
      },

      // Функция для ручного сохранения состояния
      persistState: () => {
        manualPersist(get())
      },

      // Функция для принудительного обновления состояния после гидратации
      forceUpdate: () => {
        set((state) => {
          // Создаем новую ссылку на массив, чтобы вызвать перерисовку компонентов
          return { favorites: [...state.favorites] }
        })
      },
    }),
    {
      name: 'product-favorites',
      storage: createJSONStorage(() => createCustomStorage()),
      partialize: (state) => ({
        favorites: state.favorites,
        locale: state.locale,
      }),
      // Отключаем автоматическую гидратацию в Zustand, т.к. делаем это вручную
      skipHydration: true,
      version: 1, // Версия для будущих миграций
    },
  ),
)
