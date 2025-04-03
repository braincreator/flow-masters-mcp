import { useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { fetchPayloadAPI } from '@/utilities/api'
import { User } from '@/payload-types'

const USER_ME_KEY = '/users/me'

export function useAuth() {
  const { cache, mutate } = useSWRConfig()

  const {
    data: user,
    error: userError,
    isLoading: isLoadingUser,
    mutate: mutateUser,
  } = useSWR<User | null>(
    USER_ME_KEY,
    async (endpoint: string) => {
      try {
        const userData = await fetchPayloadAPI<User>(endpoint)
        return userData
      } catch (error: any) {
        return null
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    },
  )

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await fetchPayloadAPI<{ user: User; token: string }>('/users/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })

        await mutateUser()

        return { success: true }
      } catch (error: any) {
        console.error('Login error:', error)
        return { success: false, error: error.message || 'Login failed' }
      }
    },
    [mutateUser],
  )

  const logout = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await fetchPayloadAPI<{ message: string }>('/users/logout', {
        method: 'POST',
      })

      await mutateUser(null, false)

      const CART_KEY = '/api/cart'
      const FAVORITES_KEY = '/api/favorites'

      mutate((key) => typeof key === 'string' && key.startsWith(CART_KEY), undefined, {
        revalidate: false,
      })
      mutate(FAVORITES_KEY, undefined, { revalidate: false })

      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message || 'Logout failed' }
    }
  }, [mutateUser, mutate])

  return {
    user: user ?? null,
    isLoading: isLoadingUser,
    error: userError,
    login,
    logout,
    isAuthenticated: !!user,
    mutateUser,
  }
}
