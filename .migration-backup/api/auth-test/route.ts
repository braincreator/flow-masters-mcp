import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(request: NextRequest) {
  try {
    // Get session using getServerSession
    const session = await getServerSession()

    // No need to get payload client for this test

    // Check if user is authenticated via session
    const sessionAuth = {
      isAuthenticated: !!session?.user,
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            isAdmin: session.user.isAdmin,
          }
        : null,
    }

    // Check if user is authenticated via payload
    let payloadAuth: { isAuthenticated: boolean; user: { isAdmin: boolean } | null } = {
      isAuthenticated: false,
      user: null,
    }

    try {
      // Get the token from cookies
      const token = request.cookies.get('payload-token')?.value

      if (token) {
        // Instead of using isAdmin directly, check the role from the session
        // This avoids the type error with the PayloadRequest
        const isAdminValue = session?.user?.role === 'admin'

        payloadAuth = {
          isAuthenticated: true,
          user: {
            isAdmin: isAdminValue,
          },
        }
      }
    } catch (error) {
      logError('Error checking payload auth:', error)
    }

    return NextResponse.json({
      sessionAuth,
      payloadAuth,
      cookies: Object.fromEntries(
        request.cookies.getAll().map((c) => [c.name, c.value.substring(0, 10) + '...']),
      ),
    })
  } catch (error) {
    logError('Auth test error:', error)
    return NextResponse.json({ error: 'Auth test failed' }, { status: 500 })
  }
}
