'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getFavorites, toggleFavorite } from '@/utilities/api'
import { toast } from '@/components/ui/use-toast'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Key for localStorage
const LOCAL_FAVORITES_KEY = 'local_favorites'

interface FavoritesContextType {
  favoriteProductIds: Set<string>
  isLoading: boolean
  error: Error | null
  isFavorite: (productId: string) => boolean
  toggle: (productId: string) => Promise<void>
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch favorites
  const fetchFavorites = async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      // If user is authenticated, fetch from API
      if (isAuthenticated && user) {
        const favorites = await getFavorites()
        setFavoriteProductIds(new Set(favorites))
      } else {
        // For non-authenticated users, use localStorage
        try {
          const localFavorites = localStorage.getItem(LOCAL_FAVORITES_KEY)
          const parsedFavorites = localFavorites ? JSON.parse(localFavorites) : []
          setFavoriteProductIds(new Set(parsedFavorites))
        } catch (err) {
          logError('Failed to load favorites from localStorage:', err)
          setFavoriteProductIds(new Set())
        }
      }
      
      setError(null)
    } catch (err) {
      logError('Error fetching favorites:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch favorites'))
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch favorites on mount and when auth state changes
  useEffect(() => {
    fetchFavorites()
  }, [isAuthenticated, user])

  // Check if a product is in favorites
  const isFavorite = (productId: string): boolean => {
    return favoriteProductIds.has(productId)
  }

  // Toggle a product in favorites with optimistic updates
  const toggle = async (productId: string): Promise<void> => {
    // Create a copy of the current state for optimistic update
    const previousState = new Set(favoriteProductIds)
    
    // Optimistically update UI
    const optimisticNewState = new Set(previousState)
    if (optimisticNewState.has(productId)) {
      optimisticNewState.delete(productId)
    } else {
      optimisticNewState.add(productId)
    }
    
    // Update state immediately for responsive UI
    setFavoriteProductIds(optimisticNewState)
    
    try {
      // If user is authenticated, send request to server
      if (isAuthenticated && user) {
        await toggleFavorite(productId)
      } else {
        // For non-authenticated users, save to localStorage
        localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(Array.from(optimisticNewState)))
      }
    } catch (err) {
      // Revert to previous state if there's an error
      setFavoriteProductIds(previousState)
      
      logError('Failed to toggle favorite:', err)
      toast({
        title: 'Failed to update favorites',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
      
      throw err
    }
  }

  const value = {
    favoriteProductIds,
    isLoading,
    error,
    isFavorite,
    toggle,
    refreshFavorites: fetchFavorites
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
