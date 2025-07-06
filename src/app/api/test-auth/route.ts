import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from '@/utilities/auth'

/**
 * Тестовый endpoint для проверки аутентификации MCP сервера
 */
export async function GET(request: NextRequest) {
  try {
    // Проверяем API ключ
    const authError = await verifyApiKey(request)
    if (authError) {
      return authError // Возвращаем ошибку аутентификации
    }

    // Если аутентификация прошла успешно
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      timestamp: new Date().toISOString(),
      client: request.headers.get('X-Client') || 'unknown',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем API ключ
    const authError = await verifyApiKey(request)
    if (authError) {
      return authError
    }

    const body = await request.json()

    return NextResponse.json({
      success: true,
      message: 'POST request authenticated successfully',
      receivedData: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
    }, { status: 500 })
  }
}