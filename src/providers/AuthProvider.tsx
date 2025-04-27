'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { tryCatch, AppError, ErrorType, ErrorSeverity } from '@/utilities/errorHandling'
import { useStateLogger } from '@/utilities/stateLogger'

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
  level?: number
  xp?: number
  xpToNextLevel?: number
  streak?: number
  lastActive?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AppError | null
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
  const logger = useStateLogger('AuthProvider')
  const [state, setState] = useState({
    user: null as User | null,
    isAuthenticated: false,
    isLoading: true,
    error: null as AppError | null,
  })

  const checkAuth = useCallback(async () => {
    logger.info('Checking authentication status')
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const { data, error } = await tryCatch(async () => {
      // Call Payload's /api/users/me endpoint to check authentication
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new AppError({
            message: 'Not authenticated',
            type: ErrorType.AUTHENTICATION,
            severity: ErrorSeverity.INFO,
            statusCode: response.status,
          })
        }

        throw new AppError({
          message: 'Authentication check failed',
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.ERROR,
          statusCode: response.status,
        })
      }

      return await response.json()
    })

    if (error) {
      logger.debug('Authentication check failed', undefined, undefined, { error })
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.type === ErrorType.AUTHENTICATION ? null : error,
      })
      return
    }

    if (data && data.user) {
      logger.info('User authenticated successfully', undefined, { userId: data.user.id })
      setState({
        user: {
          id: data.user.id,
          name: data.user.name || '',
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar?.url,
          level: data.user.level,
          xp: data.user.xp,
          xpToNextLevel: data.user.xpToNextLevel,
          streak: data.user.streak,
          lastActive: data.user.lastActive,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } else {
      logger.debug('No user data found')
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    logger.info('Attempting login', undefined, undefined, { email })
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const { data, error } = await tryCatch(async () => {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 401) {
          throw new AppError({
            message: errorData.message || 'Invalid email or password',
            type: ErrorType.AUTHENTICATION,
            severity: ErrorSeverity.WARNING,
            statusCode: response.status,
          })
        }

        throw new AppError({
          message: errorData.message || 'Login failed',
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.ERROR,
          statusCode: response.status,
        })
      }

      return await response.json()
    })

    if (error) {
      logger.error('Login failed', undefined, undefined, { error, email })
      setState((prev) => ({ ...prev, isLoading: false, error }))

      // Show error notification
      error.notify({
        title: 'Login Failed',
      })

      throw error
    }

    logger.info('Login successful', undefined, undefined, { email })
    await checkAuth()
    router.refresh()
  }

  const logout = async () => {
    logger.info('Attempting logout', { userId: state.user?.id })
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const { error } = await tryCatch(async () => {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new AppError({
          message: 'Logout failed',
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.ERROR,
          statusCode: response.status,
        })
      }
    })

    if (error) {
      logger.error('Logout failed', undefined, undefined, { error })
      setState((prev) => ({ ...prev, isLoading: false, error }))

      // Show error notification
      error.notify({
        title: 'Logout Failed',
      })

      return
    }

    logger.info('Logout successful', { userId: state.user?.id })
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })

    // Get current locale from URL
    const pathname = window.location.pathname
    const locale = pathname.split('/')[1] || 'ru' // Use 'ru' as default locale if not found

    router.push(`/${locale}`)
    router.refresh()
  }

  const register = async (userData: RegisterData) => {
    logger.info('Attempting registration', undefined, undefined, { email: userData.email })
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const { data, error } = await tryCatch(async () => {
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
        const errorData = await registerResponse.json()

        if (registerResponse.status === 400) {
          throw new AppError({
            message: errorData.message || 'Invalid registration data',
            type: ErrorType.VALIDATION,
            severity: ErrorSeverity.WARNING,
            statusCode: registerResponse.status,
          })
        }

        throw new AppError({
          message: errorData.message || 'Registration failed',
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.ERROR,
          statusCode: registerResponse.status,
        })
      }

      return await registerResponse.json()
    })

    if (error) {
      logger.error('Registration failed', undefined, undefined, { error, email: userData.email })
      setState((prev) => ({ ...prev, isLoading: false, error }))

      // Show error notification
      error.notify({
        title: 'Registration Failed',
      })

      throw error
    }

    logger.info('Registration successful, attempting login', undefined, undefined, {
      email: userData.email,
    })

    // Log the user in after registration
    try {
      await login(userData.email, userData.password)
    } catch (loginError) {
      // Login error is already handled in the login method
      logger.error('Auto-login after registration failed', undefined, undefined, {
        email: userData.email,
        registrationSuccessful: true,
      })
    }
  }

  const refreshAuth = useCallback(async () => {
    await checkAuth()
  }, [checkAuth])

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
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
