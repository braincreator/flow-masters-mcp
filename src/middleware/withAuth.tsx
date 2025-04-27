import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayloadClient } from '@/utilities/payload'

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
) {
  try {
    const payload = await getPayloadClient()

    // Try to get the user from the request
    let user = null

    try {
      // Get user from Payload using the cookie
      const cookieStore = await cookies()
      user = await payload.findGlobalByID({
        id: 'current-user',
        req: { cookies: cookieStore.getAll() },
      })
    } catch (error) {
      console.error('Error fetching user:', error)
    }

    // If no user is found, redirect to login
    if (!user || !user.id) {
      // Получаем текущую локаль из URL
      const pathname = req.nextUrl.pathname
      const locale = pathname.split('/')[1] || 'ru' // Используем 'ru' как дефолтную локаль, если не найдена

      // Создаем URL для перенаправления с сохранением локали
      const url = new URL(`/${locale}/login`, req.url)
      url.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // User is authenticated, proceed with the handler
    return handler(req, user)
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
