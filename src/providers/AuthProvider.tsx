'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  refreshAuth: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState({
    user: null as User | null,
    isAuthenticated: false,
    isLoading: true,
  })

  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      // Call Payload's /api/users/me endpoint to check authentication
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Not authenticated')
      }

      const data = await response.json()

      if (data && data.user) {
        setState({
          user: {
            id: data.user.id,
            name: data.user.name || '',
            email: data.user.email,
            role: data.user.role,
            avatar: data.user.avatar?.url,
          },
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      await checkAuth()
      router.refresh()
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      // Register the user
      const registerResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          role: 'customer', // Default role for students
        }),
      })

      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        throw new Error(error.message || 'Registration failed')
      }

      // Log the user in after registration
      await login(userData.email, userData.password)
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const refreshAuth = useCallback(async () => {
    await checkAuth()
  }, [checkAuth])

  const value = {
    ...state,
    login,
    logout,
    register,
    refreshAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
