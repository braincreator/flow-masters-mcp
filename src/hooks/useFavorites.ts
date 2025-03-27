'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/payload-types'

interface FavoritesStore {
  favorites: Product[]
  addToFavorites: (product: Product) => void
  removeFromFavorites: (productId: string) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
  count: number
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addToFavorites: (product) =>
        set((state) => {
          if (!product?.id) return state

          // Check if product is already in favorites
          if (state.favorites.some((favorite) => favorite.id === product.id)) {
            return state
          }

          return {
            favorites: [...state.favorites, product],
          }
        }),

      removeFromFavorites: (productId) =>
        set((state) => ({
          favorites: state.favorites.filter((product) => product.id !== productId),
        })),

      isFavorite: (productId) => {
        return get().favorites.some((product) => product.id === productId)
      },

      clearFavorites: () => set({ favorites: [] }),

      get count() {
        return get().favorites.length
      },
    }),
    {
      name: 'product-favorites',
      skipHydration: true,
    },
  ),
)
