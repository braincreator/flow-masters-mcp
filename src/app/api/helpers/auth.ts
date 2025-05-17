import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import payload from 'payload'

// Функция для получения текущего пользователя из запроса
export async function getAuth(req: NextRequest) {
  try {
    // Получение куки из запроса
    const cookieStore = cookies()
    const payloadToken = cookieStore.get('payload-token')?.value

    if (!payloadToken) {
      return { user: null }
    }

    // Проверка токена и получение пользователя
    const { user } = await payload.authenticate({
      collection: 'users',
      token: payloadToken,
    })

    return { user }
  } catch (error) {
    console.error('Authentication error:', error)
    return { user: null }
  }
}
