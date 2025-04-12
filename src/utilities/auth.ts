import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayloadClient } from './payload'
import { errorResponse } from './api'
import { cookies } from 'next/headers'

// Import Payload type if needed for casting
import type { Payload } from 'payload/types'
import type { ApiKey } from '@/payload-types' // Import generated type for ApiKey

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

    const payload = await getPayloadClient() // Use existing client getter

    const apiKeyQuery = await payload.find({
      collection: 'apiKeys',
      where: {
        key: { equals: providedKey },
        isEnabled: { equals: true },
      },
      limit: 1,
      depth: 0,
    })

    const isValid = apiKeyQuery.docs.length > 0

    return {
      isAuthenticated: isValid,
      error: isValid ? undefined : 'Invalid or disabled API key',
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
  const signature = req.headers.get('x-webhook-signature')

  if (!signature) {
    return { isAuthenticated: false, error: 'Missing webhook signature' }
  }

  try {
    const body = await req.text()
    const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
    const computedSignature = hmac.update(body).digest('hex')

    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature))

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

async function authenticateUser(req: Request): Promise<AuthResult> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return { isAuthenticated: false, error: 'Missing authentication token' }
    }
    // Implement JWT verification here
    // Return user data if verified
    return {
      isAuthenticated: false,
      error: 'JWT verification not implemented',
    }
  } catch (error) {
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
    const payload = await getPayloadClient()
    const apiKeyQuery = await payload.find({
      collection: 'apiKeys',
      where: {
        key: { equals: providedKey },
        isEnabled: { equals: true },
      },
      limit: 1,
      depth: 0,
    })

    if (apiKeyQuery.docs.length === 0) {
      return errorResponse('Invalid or disabled API key', 403) // Use 403 Forbidden for invalid keys
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

export async function verifyAuth(request: Request): Promise<AuthResult> {
  try {
    const payload = await getPayloadClient()

    // Try to get the user from request and ensure they're authenticated
    let user = null

    try {
      // Try to get existing user session
      user = await payload.findGlobalByID({
        id: 'current-user',
        req: { cookies: cookies().getAll() },
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      return {
        isAuthenticated: false,
        error: 'Not authenticated',
      }
    }

    if (!user) {
      return {
        isAuthenticated: false,
        error: 'Not authenticated',
      }
    }

    // Check if user exists and is verified
    if (!user.id || user.banned) {
      return {
        isAuthenticated: false,
        error: 'Forbidden: User is banned or invalid',
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

    // Add isAdmin flag based on roles
    if (user.roles && (user.roles.includes('admin') || user.roles.includes('super-admin'))) {
      user.isAdmin = true
    } else {
      user.isAdmin = false
    }

    return {
      isAuthenticated: true,
      user,
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return {
      isAuthenticated: false,
      error: 'Authorization error',
    }
  }
}
