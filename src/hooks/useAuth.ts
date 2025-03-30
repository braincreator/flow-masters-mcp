import { useState, useEffect } from 'react'

// Mock user data for development
const MOCK_USER = {
  id: 'user123',
  email: 'user@example.com',
  name: 'Test User',
  roles: ['user'],
}

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true)

        // In a real app, this would be an API call to validate session
        // For now, simulate a network request
        setTimeout(() => {
          // In development, return mock user data
          if (process.env.NODE_ENV === 'development') {
            setUser(MOCK_USER)
            setIsLoading(false)
            return
          }

          // In production, check if user is logged in
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser))
            } catch (e) {
              console.error('Error parsing user data:', e)
              setUser(null)
            }
          } else {
            setUser(null)
          }

          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error('Error loading user:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      // In a real app, this would be an API call to login
      // For now, simulate a successful login

      // In production, this would make an actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // })

      // const data = await response.json()
      // if (!response.ok) throw new Error(data.error || 'Login failed')

      // Save user data
      const userData = {
        id: 'user123',
        email,
        name: 'User',
        roles: ['user'],
      }

      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Login failed')
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)

      // In a real app, this would be an API call to logout
      // For now, just clear local storage

      // In production, this would make an actual API call
      // await fetch('/api/auth/logout', { method: 'POST' })

      localStorage.removeItem('user')
      setUser(null)

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
