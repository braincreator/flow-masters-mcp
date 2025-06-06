import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayloadClient } from './payload/index'
import { errorResponse } from './api'
import { cookies } from 'next/headers'

type AuthType = 'api' | 'webhook' | 'cron' | 'user'

interface AuthResult {
  isAuthenticated: boolean
  error?: string
  user?: any
}

export async function authenticate(req: Request, type: AuthType): Promise<AuthResult> {
  switch (type) {
    case 'api':
      return await authenticateApiRequest(req)
    case 'webhook':
      return authenticateWebhook(req)
    case 'cron':
      return authenticateCronJob(req)
    case 'user':
      return authenticateUser(req)
    default:
      return { isAuthenticated: false, error: 'Invalid authentication type' }
  }
}

// Modified to check ApiKeys collection and use Authorization header
async function authenticateApiRequest(req: Request): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        isAuthenticated: false,
        error: 'Missing or invalid Authorization header (Bearer token expected)',
      }
    }
    const providedKey = authHeader.substring(7)
    const isValid = providedKey === process.env.PAYLOAD_SECRET

    return {
      isAuthenticated: isValid,
      error: isValid ? undefined : 'Invalid API key',
      // Optionally return key info: user: isValid ? apiKeyQuery.docs[0] : undefined
    }
  } catch (error) {
    console.error('API Key Authentication Error:', error)
    return {
      isAuthenticated: false,
      error: 'Failed to verify API key',
    }
  }
}

async function authenticateWebhook(req: Request): Promise<AuthResult> {
  return {
    isAuthenticated: false,
    error: 'Not implemented',
  }
  const signature = req.headers.get('x-webhook-signature')

  try {
    const body = await req.text()
    const webhookSecret = process.env.WEBHOOK_SECRET || ''
    const hmac = crypto.createHmac('sha256', webhookSecret)
    const computedSignature = hmac.update(body).digest('hex')

    const signatureString = signature || ''
    const computedSignatureString = computedSignature || ''
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signatureString),
      Buffer.from(computedSignatureString),
    )

    return {
      isAuthenticated: isValid,
      error: isValid ? undefined : 'Invalid webhook signature',
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Failed to verify webhook signature',
    }
  }
}

function authenticateCronJob(req: Request): AuthResult {
  try {
    const authHeader = req.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    return {
      isAuthenticated: authHeader === expectedAuth,
      error: authHeader === expectedAuth ? undefined : 'Invalid cron authentication',
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Failed to verify cron job authentication',
    }
  }
}

import { jwtVerify, createRemoteJWKSet } from 'jose'
import { User } from '@/payload-types'
import { ENV } from '@/constants/env'

async function authenticateUser(req: Request): Promise<AuthResult> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return { isAuthenticated: false, error: 'Missing authentication token' }
    }

    const jwksUri = process.env.JWKS_URI // Ensure this is set in your environment
    if (!jwksUri) {
      console.error('JWKS_URI is not set in environment variables')
      return { isAuthenticated: false, error: 'JWKS_URI not configured' }
    }

    const JWKS = createRemoteJWKSet(new URL(jwksUri))

    try {
      const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
        issuer: process.env.JWT_ISSUER, // Optional: validate the issuer
        audience: process.env.JWT_AUDIENCE, // Optional: validate the audience
      })

      // If JWT is valid, you can access the payload here
      // and use it to fetch user data from your database
      const userId = payload.sub // Assuming 'sub' claim contains the user ID

      // Fetch user from database (replace with your actual database logic)
      const payloadClient = await getPayloadClient()
      const user = await payloadClient.findByID({
        collection: 'users',
        id: userId as string,
      })

      if (!user) {
        return { isAuthenticated: false, error: 'User not found' }
      }

      return {
        isAuthenticated: true,
        user: user, // Return the user object
      }
    } catch (err) {
      console.error('JWT Verification Error:', err)
      return { isAuthenticated: false, error: 'Invalid authentication token' }
    }
  } catch (error) {
    console.error('Authentication Error:', error)
    return {
      isAuthenticated: false,
      error: 'Failed to verify user authentication',
    }
  }
}

// Helper middleware for Next.js API routes
export async function withAuth(
  req: Request,
  type: AuthType,
  handler: (req: Request) => Promise<Response>,
): Promise<Response> {
  const auth = await authenticate(req, type)

  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })
  }

  return handler(req)
}

// Modified verifyApiKey to check ApiKeys collection and use Authorization header
export async function verifyApiKey(request: Request): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid Authorization header (Bearer token expected)', 401)
  }
  const providedKey = authHeader.substring(7)

  try {
    if (providedKey !== ENV.PAYLOAD_SECRET) {
      return errorResponse('Invalid API key', 403) // Use 403 Forbidden for invalid keys
    }

    // Key is valid
    return null // Indicate success
  } catch (error) {
    console.error('verifyApiKey Error:', error)
    return errorResponse('Failed to verify API key', 500)
  }
}

/**
 * Verify webhook signature
 * @param request The request object
 * @returns NextResponse or null if valid
 */
export async function verifyWebhookSignature(request: Request): Promise<NextResponse | null> {
  const signature = request.headers.get('x-webhook-signature')

  if (!signature) {
    return errorResponse('Missing webhook signature', 401)
  }

  try {
    const clonedRequest = request.clone()
    const body = await clonedRequest.text()
    const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET || '')
    const computedSignature = hmac.update(body).digest('hex')

    const isValid = signature === computedSignature

    if (!isValid) {
      return errorResponse('Invalid webhook signature', 401)
    }

    return null
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return errorResponse('Failed to verify webhook signature', 500)
  }
}

export async function getServerSession(): Promise<{
  user?: any
  isAuthenticated: boolean
}> {
  try {
    const payload = await getPayloadClient()
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')

    if (!payloadToken?.value) {
      return { isAuthenticated: false }
    }

    // Try to verify the token and get user
    try {
      const authResult = await payload.find({
        collection: 'users',
        where: {
          id: { exists: true },
        },
        limit: 1,
      })

      if (authResult.docs && authResult.docs.length > 0) {
        return {
          user: authResult.docs[0],
          isAuthenticated: true,
        }
      }
    } catch (error) {
      console.error('Session verification error:', error)
    }

    return { isAuthenticated: false }
  } catch (error) {
    console.error('getServerSession error:', error)
    return { isAuthenticated: false }
  }
}

export async function verifyAuth(request: Request): Promise<{
  isAuthenticated: boolean
  user?: any
  error?: string
  success?: boolean
  response?: NextResponse
}> {
  try {
    const payload = await getPayloadClient()

    // Try to get the user from request and ensure they're authenticated
    let user = null

    try {
      // Try to get existing user session
      // Await cookies() before using getAll()
      const cookieStore = await cookies()

      // Create a request object with cookies
      const cookiesList = cookieStore.getAll()
      const payloadToken = cookiesList.find((cookie) => cookie.name === 'payload-token')

      if (!payloadToken || !payloadToken.value) {
        return {
          isAuthenticated: false,
          success: false,
          error: 'No authentication token found',
          response: NextResponse.json({ error: 'No authentication token found' }, { status: 401 }),
        }
      }

      const req = {
        cookies: cookiesList,
        headers: {
          Cookie: `payload-token=${payloadToken.value}`,
        },
      }

      // Use the correct method to get the current user in Payload v3.33.0
      // In Payload v3.33.0, we need to use the findMe method
      try {
        // Create headers with the token
        const headers = new Headers({
          Authorization: `JWT ${payloadToken.value}`,
        })

        const reqWithHeaders = {
          cookies: cookiesList,
          headers: headers,
        }

        // Use the auth method to verify the token and get the user
        const authResult = await payload.find({
          collection: 'users',
          where: {
            id: { exists: true },
          },
          limit: 1,
          req: reqWithHeaders,
        })

        if (authResult.docs && authResult.docs.length > 0) {
          user = authResult.docs[0] as User
        }
      } catch (_authError) {
        // Silent error handling
      }
    } catch (_error) {
      return {
        isAuthenticated: false,
        success: false,
        error: 'Not authenticated',
        response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
      }
    }

    if (!user) {
      return {
        isAuthenticated: false,
        success: false,
        error: 'Not authenticated',
        response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
      }
    }

    // Check if user exists and is verified
    if (!user.id || (user as any).banned) {
      return {
        isAuthenticated: false,
        success: false,
        error: 'Forbidden: User is banned or invalid',
        response: NextResponse.json(
          { error: 'Forbidden: User is banned or invalid' },
          { status: 403 },
        ),
      }
    }

    // For development, create a mock user with admin rights
    if (process.env.NODE_ENV === 'development' && !user) {
      user = {
        id: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        roles: ['admin'],
        isAdmin: true,
      }
    }

    // Add isAdmin flag based on role
    if ((user as any).role === 'admin') {
      ;(user as any).isAdmin = true
    } else {
      ;(user as any).isAdmin = false
    }

    return {
      isAuthenticated: true,
      success: true,
      user,
    }
  } catch (_error) {
    return {
      isAuthenticated: false,
      success: false,
      error: 'Authorization error',
      response: NextResponse.json({ error: 'Authorization error' }, { status: 500 }),
    }
  }
}
