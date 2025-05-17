import { cookies } from 'next/headers'
import { getPayloadClient } from './getPayloadClient'

// Тип для данных пользователя в сессии
export interface SessionUser {
  id: string
  email: string
  name?: string
  roles?: string[]
  [key: string]: any
}

// Тип для данных сессии
export interface Session {
  user: SessionUser | null
  token?: string
}

/**
 * Получает информацию о текущей сессии пользователя на стороне сервера
 *
 * @returns Объект с данными сессии или null, если пользователь не авторизован
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    // Получаем куки запроса
    const cookieStore = cookies()
    const payloadToken = cookieStore.get('payload-token')?.value

    if (!payloadToken) {
      return { user: null }
    }

    // Получаем экземпляр Payload
    const payload = await getPayloadClient()

    // Проверяем валидность токена и получаем данные пользователя
    try {
      const { user } = await payload.verifyToken({
        token: payloadToken,
        collection: 'users',
      })

      if (!user || !user.id) {
        return { user: null }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          ...user,
        },
        token: payloadToken,
      }
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError)
      return { user: null }
    }
  } catch (error) {
    console.error('Error getting server session:', error)
    return { user: null }
  }
}
