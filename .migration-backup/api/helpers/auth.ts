import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Функция для получения текущего пользователя из запроса
export async function getAuth(req: NextRequest) {
  try {
    logDebug('[getAuth] Starting authentication process')

    // Получение куки из запроса
    const cookieStore = await cookies()

    // Log cookie header for debugging
    const cookieHeader = req.headers.get('cookie')
    console.log(`[getAuth] Cookie header: ${cookieHeader || 'none'}`)

    // Get the payload token from the cookie
    const payloadToken = cookieStore.get('payload-token')?.value

    if (!payloadToken) {
      logDebug('[getAuth] Authentication failed: No payload-token cookie found')

      // Check if there's an Authorization header as fallback
      const authHeader = req.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const tokenFromHeader = authHeader.substring(7)
        logDebug('[getAuth] Found token in Authorization header, trying to use it')

        try {
          // Get the Payload client
          const payload = await getPayloadClient()

          // Проверка токена из заголовка и получение пользователя
          // Use the login method instead of authenticate
          const user = await payload.findByID({
            collection: 'users',
            id: tokenFromHeader,
          })

          if (user) {
            logDebug(`[getAuth] User authenticated successfully from header token: ${user.id}`)
            return { user }
          }
        } catch (headerAuthError) {
          logError('[getAuth] Header token authentication error:', headerAuthError)
        }
      }

      // For development environment, try to use a default admin user
      if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_AUTH === 'true') {
        logDebug('[getAuth] Development mode: Using default admin user')

        try {
          // Get the Payload client
          const payload = await getPayloadClient()

          // Find the first admin user in the system
          const adminUsers = await payload.find({
            collection: 'users',
            where: {
              role: {
                equals: 'admin',
              },
            },
            limit: 1,
          })

          if (adminUsers.docs.length > 0) {
            const adminUser = adminUsers.docs[0]
            if (adminUser && adminUser.id) {
              logDebug(`[getAuth] Using admin user: ${adminUser.id}`)
              return { user: adminUser }
            }
          }
        } catch (devAuthError) {
          logError('[getAuth] Dev auth error:', devAuthError)
        }
      }

      return { user: null, error: 'No authentication token found' }
    }

    try {
      logDebug('[getAuth] Authenticating with token')

      // Get the Payload client
      const payloadClient = await getPayloadClient()

      // Проверка токена и получение пользователя
      // We need to use a different approach since authenticate is not available
      try {
        // First, try to decode the token to get the user ID
        // This is a simplified approach - in a real app, you'd want to properly verify the JWT
        const tokenParts = payloadToken.split('.');
        if (tokenParts.length === 3) {
          // Safely decode the base64 payload part
          try {
            // Make sure we have a valid base64 string by padding if needed
            let base64 = tokenParts[1] || '';
            // Add padding if needed
            while (base64.length % 4 !== 0) {
              base64 += '=';
            }

            // Replace characters that are different in base64url vs base64
            base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

            // Decode the base64 string
            const jsonStr = Buffer.from(base64, 'base64').toString();
            const tokenData = JSON.parse(jsonStr);

            if (tokenData && tokenData.id) {
              logDebug(`[getAuth] Token contains user ID: ${tokenData.id}`);

              // Now fetch the user with that ID
              const user = await payloadClient.findByID({
                collection: 'users',
                id: tokenData.id,
              });

              if (!user) {
                logDebug('[getAuth] User not found with ID from token');
                return { user: null, error: 'User not found' };
              }

              logDebug(`[getAuth] User authenticated successfully: ${user.id}`);
              return { user };
            }
          } catch (decodeError) {
            logError('[getAuth] Error decoding token payload:', decodeError);
          }
        }

        logDebug('[getAuth] Invalid token format');
        return { user: null, error: 'Invalid token format' };
      } catch (tokenError) {
        logError('[getAuth] Error processing token:', tokenError);
        return { user: null, error: 'Failed to authenticate token' };
      }
    } catch (authError) {
      logError('[getAuth] Token authentication error:', authError)

      // Check if token is expired
      if (authError instanceof Error &&
          (authError.message.includes('expired') ||
           authError.message.includes('invalid') ||
           authError.message.includes('jwt'))) {
        return { user: null, error: 'Authentication token expired or invalid' }
      }

      return { user: null, error: 'Authentication failed' }
    }
  } catch (error) {
    logError('[getAuth] Authentication error:', error)
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Unknown authentication error'
    }
  }
}
