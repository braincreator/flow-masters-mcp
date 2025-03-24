import { NextResponse } from 'next/server'
import crypto from 'crypto'

type AuthType = 'api' | 'webhook' | 'cron' | 'user'

interface AuthResult {
  isAuthenticated: boolean
  error?: string
  user?: any
}

export async function authenticate(req: Request, type: AuthType): Promise<AuthResult> {
  switch (type) {
    case 'api':
      return authenticateApiRequest(req)
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

function authenticateApiRequest(req: Request): AuthResult {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return { isAuthenticated: false, error: 'Missing API key' }
    }
    return {
      isAuthenticated: apiKey === process.env.PAYLOAD_SECRET,
      error: apiKey === process.env.PAYLOAD_SECRET ? undefined : 'Invalid API key'
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Failed to verify API key'
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

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    )

    return {
      isAuthenticated: isValid,
      error: isValid ? undefined : 'Invalid webhook signature'
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Failed to verify webhook signature'
    }
  }
}

function authenticateCronJob(req: Request): AuthResult {
  try {
    const authHeader = req.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    return {
      isAuthenticated: authHeader === expectedAuth,
      error: authHeader === expectedAuth ? undefined : 'Invalid cron authentication'
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Failed to verify cron job authentication'
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
      error: 'JWT verification not implemented'
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Failed to verify user authentication'
    }
  }
}

// Helper middleware for Next.js API routes
export async function withAuth(
  req: Request,
  type: AuthType,
  handler: (req: Request) => Promise<Response>
): Promise<Response> {
  const auth = await authenticate(req, type)
  
  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  return handler(req)
}
