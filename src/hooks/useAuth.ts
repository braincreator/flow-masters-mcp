'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Это заглушка для хука аутентификации
// В реальном приложении здесь будет логика работы с сессией/JWT/cookies
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Имитация проверки аутентификации
    const checkAuth = async () => {
      try {
        // В реальном приложении здесь будет запрос к API для проверки токена/сессии
        // Например: const response = await fetch('/api/auth/me')

        // Имитация задержки запроса
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Проверяем, есть ли в localStorage сохраненный пользователь
        const storedUser = localStorage.getItem('current_user')

        if (storedUser) {
          const user = JSON.parse(storedUser)
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          // Пользователь не авторизован
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
    }

    checkAuth()
  }, [])

  return state
}
