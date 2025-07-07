import { getPayloadClient } from '@/utilities/payload'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

export interface ApiKeyValidationResult {
  isValid: boolean
  keyData?: any
  error?: string
  permissions?: string[]
  rateLimit?: {
    enabled: boolean
    requestsPerHour: number
    requestsPerMinute: number
  }
}

export interface CreateApiKeyData {
  name: string
  description?: string
  keyType: 'general' | 'mcp' | 'mobile' | 'integration' | 'development' | 'webhook'
  permissions?: string[]
  allowedIPs?: { ip: string }[]
  rateLimit?: {
    enabled: boolean
    requestsPerHour: number
    requestsPerMinute: number
  }
  expiresAt?: Date
  createdBy?: string
  notes?: string
  tags?: { tag: string }[]
}

export interface UpdateApiKeyUsageData {
  keyId: string
  ip?: string
  userAgent?: string
}

export class ApiKeyService {
  private payload: any

  constructor() {
    this.payload = null
  }

  private async getPayload() {
    if (!this.payload) {
      this.payload = await getPayloadClient()
    }
    return this.payload
  }

  /**
   * Validate an API key and return key data if valid
   */
  async validateApiKey(providedKey: string, clientIP?: string): Promise<ApiKeyValidationResult> {
    try {
      const payload = await this.getPayload()

      // First check if it's the master PAYLOAD_SECRET
      if (providedKey === process.env.PAYLOAD_SECRET) {
        return {
          isValid: true,
          keyData: {
            name: 'Master Key',
            keyType: 'admin',
            permissions: ['read', 'write', 'delete', 'admin', 'debug'],
          },
          permissions: ['read', 'write', 'delete', 'admin', 'debug'],
        }
      }

      // Query the database for the API key
      const apiKeyQuery = await payload.find({
        collection: 'apiKeys',
        where: {
          isEnabled: { equals: true },
        },
        limit: 100, // Get all enabled keys to check against
      })

      // Find matching key by comparing hashes
      let matchingKey = null
      for (const keyDoc of apiKeyQuery.docs) {
        if (keyDoc.hashedKey && await bcrypt.compare(providedKey, keyDoc.hashedKey)) {
          matchingKey = keyDoc
          break
        }
        // Fallback for unhashed keys (legacy support)
        if (!keyDoc.hashedKey && keyDoc.key === providedKey) {
          matchingKey = keyDoc
          break
        }
      }

      if (!matchingKey) {
        logWarn(`[ApiKeyService] Invalid API key attempt from IP: ${clientIP}`)
        return {
          isValid: false,
          error: 'Invalid API key'
        }
      }

      // Check if key is expired
      if (matchingKey.expiresAt && new Date() > new Date(matchingKey.expiresAt)) {
        logWarn(`[ApiKeyService] Expired API key used: ${matchingKey.name} from IP: ${clientIP}`)
        return {
          isValid: false,
          error: 'API key has expired'
        }
      }

      // Check IP restrictions
      if (matchingKey.allowedIPs && matchingKey.allowedIPs.length > 0 && clientIP) {
        const isIPAllowed = matchingKey.allowedIPs.some((allowedIP: any) => {
          return this.isIPInRange(clientIP, allowedIP.ip)
        })

        if (!isIPAllowed) {
          logWarn(`[ApiKeyService] IP restriction violation for key: ${matchingKey.name}, IP: ${clientIP}`)
          return {
            isValid: false,
            error: 'IP address not allowed for this API key'
          }
        }
      }

      logInfo(`[ApiKeyService] Valid API key used: ${matchingKey.name} from IP: ${clientIP}`)

      return {
        isValid: true,
        keyData: matchingKey,
        permissions: matchingKey.permissions || ['read'],
        rateLimit: matchingKey.rateLimit
      }
    } catch (error) {
      logError('[ApiKeyService] Error validating API key:', error)
      return {
        isValid: false,
        error: 'Failed to validate API key'
      }
    }
  }

  /**
   * Create a new API key
   */
  async createApiKey(data: CreateApiKeyData): Promise<{ success: boolean; key?: string; id?: string; error?: string }> {
    try {
      const payload = await this.getPayload()

      // Generate a secure API key
      const apiKey = crypto.randomBytes(32).toString('hex')

      // Create the API key record
      const result = await payload.create({
        collection: 'apiKeys',
        data: {
          ...data,
          key: apiKey,
          isEnabled: true,
          usageCount: 0,
        }
      })

      logInfo(`[ApiKeyService] New API key created: ${data.name} (ID: ${result.id})`)

      return {
        success: true,
        key: apiKey,
        id: result.id
      }
    } catch (error) {
      logError('[ApiKeyService] Error creating API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create API key'
      }
    }
  }

  /**
   * Update API key usage statistics
   */
  async updateKeyUsage(data: UpdateApiKeyUsageData): Promise<void> {
    try {
      const payload = await this.getPayload()

      await payload.update({
        collection: 'apiKeys',
        id: data.keyId,
        data: {
          lastUsed: new Date(),
          lastUsedIP: data.ip,
          lastUsedUserAgent: data.userAgent,
          usageCount: { $inc: 1 }, // Increment usage count
        }
      })
    } catch (error) {
      logError('[ApiKeyService] Error updating key usage:', error)
    }
  }

  /**
   * Rotate an API key (generate new key, disable old one)
   */
  async rotateApiKey(keyId: string): Promise<{ success: boolean; newKey?: string; error?: string }> {
    try {
      const payload = await this.getPayload()

      // Get the existing key
      const existingKey = await payload.findByID({
        collection: 'apiKeys',
        id: keyId
      })

      if (!existingKey) {
        return {
          success: false,
          error: 'API key not found'
        }
      }

      // Generate new key
      const newApiKey = crypto.randomBytes(32).toString('hex')

      // Update the key
      await payload.update({
        collection: 'apiKeys',
        id: keyId,
        data: {
          key: newApiKey,
          // Reset usage stats
          usageCount: 0,
          lastUsed: null,
          lastUsedIP: null,
          lastUsedUserAgent: null,
        }
      })

      logInfo(`[ApiKeyService] API key rotated: ${existingKey.name} (ID: ${keyId})`)

      return {
        success: true,
        newKey: newApiKey
      }
    } catch (error) {
      logError('[ApiKeyService] Error rotating API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to rotate API key'
      }
    }
  }

  /**
   * Disable an API key
   */
  async disableApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = await this.getPayload()

      await payload.update({
        collection: 'apiKeys',
        id: keyId,
        data: {
          isEnabled: false
        }
      })

      logInfo(`[ApiKeyService] API key disabled: ${keyId}`)

      return { success: true }
    } catch (error) {
      logError('[ApiKeyService] Error disabling API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disable API key'
      }
    }
  }

  /**
   * Get API key statistics
   */
  async getKeyStatistics(): Promise<any> {
    try {
      const payload = await this.getPayload()

      const stats = await payload.find({
        collection: 'apiKeys',
        limit: 0, // Get count only
      })

      const enabledKeys = await payload.find({
        collection: 'apiKeys',
        where: {
          isEnabled: { equals: true }
        },
        limit: 0,
      })

      const expiredKeys = await payload.find({
        collection: 'apiKeys',
        where: {
          expiresAt: { less_than: new Date() }
        },
        limit: 0,
      })

      return {
        total: stats.totalDocs,
        enabled: enabledKeys.totalDocs,
        disabled: stats.totalDocs - enabledKeys.totalDocs,
        expired: expiredKeys.totalDocs,
      }
    } catch (error) {
      logError('[ApiKeyService] Error getting key statistics:', error)
      return {
        total: 0,
        enabled: 0,
        disabled: 0,
        expired: 0,
      }
    }
  }

  /**
   * Check if IP is in allowed range (supports CIDR notation)
   */
  private isIPInRange(ip: string, range: string): boolean {
    // Simple IP matching for now
    // TODO: Implement proper CIDR range checking
    if (range.includes('/')) {
      // CIDR notation - simplified check
      const [rangeIP] = range.split('/')
      return ip.startsWith(rangeIP.split('.').slice(0, 3).join('.'))
    }
    return ip === range
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService()
