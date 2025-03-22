import crypto from 'crypto'

export function verifyApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false
  const validApiKeys = process.env.API_KEYS?.split(',') || []
  return validApiKeys.includes(apiKey)
}

export function verifyWebhookSignature(signature: string | null, body: string): boolean {
  if (!signature || !process.env.WEBHOOK_SECRET) return false
  
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
  const computedSignature = hmac.update(body).digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  )
}

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex')
}