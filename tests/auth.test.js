/**
 * Unit tests for authentication system
 * Tests core authentication functions and middleware
 */

import { jest } from '@jest/globals'

// Mock environment variables
process.env.PAYLOAD_SECRET = 'test-secret-key'

// Mock logger functions
jest.mock('@/utils/logger', () => ({
  logDebug: jest.fn(),
  logInfo: jest.fn(),
  logWarn: jest.fn(),
  logError: jest.fn(),
}))

// Mock Next.js Response
const mockNextResponse = {
  json: jest.fn((data, options) => ({
    data,
    status: options?.status || 200,
    headers: options?.headers || {}
  })),
  next: jest.fn((options) => ({
    request: options?.request || {}
  }))
}

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse
}))

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset global metrics
    if (typeof globalThis !== 'undefined') {
      globalThis.authMetrics = { bearer: 0, 'x-api-key': 0 }
    }
  })

  describe('verifyApiKey function', () => {
    let verifyApiKey

    beforeAll(async () => {
      // Dynamic import to ensure mocks are in place
      const authModule = await import('../src/utilities/auth.ts')
      verifyApiKey = authModule.verifyApiKey
    })

    test('should accept valid Bearer token', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'Authorization') return 'Bearer test-secret-key'
            return null
          })
        }
      }

      const result = await verifyApiKey(mockRequest)
      expect(result).toBeNull() // null indicates success
    })

    test('should accept valid x-api-key header', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'Authorization') return null
            if (header === 'x-api-key') return 'test-secret-key'
            return null
          })
        }
      }

      const result = await verifyApiKey(mockRequest)
      expect(result).toBeNull() // null indicates success
    })

    test('should reject invalid Bearer token', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'Authorization') return 'Bearer invalid-token'
            return null
          })
        }
      }

      const result = await verifyApiKey(mockRequest)
      expect(result).not.toBeNull()
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid API key' },
        { status: 403 }
      )
    })

    test('should reject request with no authentication', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        }
      }

      const result = await verifyApiKey(mockRequest)
      expect(result).not.toBeNull()
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Missing API key') },
        { status: 401 }
      )
    })

    test('should prefer Bearer token when both headers present', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'Authorization') return 'Bearer test-secret-key'
            if (header === 'x-api-key') return 'different-key'
            return null
          })
        }
      }

      const result = await verifyApiKey(mockRequest)
      expect(result).toBeNull() // Should succeed with Bearer token
    })
  })

  describe('Authentication Metrics', () => {
    let getAuthMetrics, resetAuthMetrics

    beforeAll(async () => {
      const authModule = await import('../src/utilities/auth.ts')
      getAuthMetrics = authModule.getAuthMetrics
      resetAuthMetrics = authModule.resetAuthMetrics
    })

    test('should track authentication metrics', () => {
      // Simulate some authentication attempts
      globalThis.authMetrics = { bearer: 5, 'x-api-key': 3 }

      const metrics = getAuthMetrics()
      expect(metrics.bearer).toBe(5)
      expect(metrics['x-api-key']).toBe(3)
      expect(metrics.total).toBe(8)
    })

    test('should reset metrics correctly', () => {
      globalThis.authMetrics = { bearer: 10, 'x-api-key': 5 }
      
      resetAuthMetrics()
      
      const metrics = getAuthMetrics()
      expect(metrics.bearer).toBe(0)
      expect(metrics['x-api-key']).toBe(0)
      expect(metrics.total).toBe(0)
    })

    test('should handle missing metrics gracefully', () => {
      delete globalThis.authMetrics
      
      const metrics = getAuthMetrics()
      expect(metrics.bearer).toBe(0)
      expect(metrics['x-api-key']).toBe(0)
      expect(metrics.total).toBe(0)
    })
  })

  describe('Authentication Middleware', () => {
    let authMiddleware

    beforeAll(async () => {
      const middlewareModule = await import('../src/middleware/auth.ts')
      authMiddleware = middlewareModule.authMiddleware
    })

    test('should allow public paths without authentication', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/api/health' },
        method: 'GET',
        headers: { get: jest.fn(() => null) }
      }

      const result = await authMiddleware(mockRequest)
      expect(result).toBeNull() // null means continue without auth
    })

    test('should require authentication for protected paths', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/api/posts' },
        method: 'GET',
        headers: { get: jest.fn(() => null) }
      }

      const result = await authMiddleware(mockRequest)
      expect(result).not.toBeNull()
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Missing API key') },
        expect.objectContaining({ status: 401 })
      )
    })

    test('should handle dynamic collection routes', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/api/categories' },
        method: 'GET',
        headers: {
          get: jest.fn((header) => {
            if (header === 'Authorization') return 'Bearer test-secret-key'
            return null
          })
        }
      }

      const result = await authMiddleware(mockRequest)
      expect(result).not.toBeNull()
      expect(mockNextResponse.next).toHaveBeenCalled()
    })

    test('should skip custom auth paths', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/api/revalidate' },
        method: 'POST',
        headers: { get: jest.fn(() => null) }
      }

      const result = await authMiddleware(mockRequest)
      expect(result).toBeNull() // Should skip middleware for custom auth
    })
  })

  describe('Error Handling', () => {
    let verifyApiKey

    beforeAll(async () => {
      const authModule = await import('../src/utilities/auth.ts')
      verifyApiKey = authModule.verifyApiKey
    })

    test('should handle malformed Authorization header', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'Authorization') return 'InvalidFormat token'
            return null
          })
        }
      }

      const result = await verifyApiKey(mockRequest)
      expect(result).not.toBeNull()
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Missing API key') },
        { status: 401 }
      )
    })

    test('should handle empty headers gracefully', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => '')
        }
      }

      const result = await verifyApiKey(mockRequest)
      expect(result).not.toBeNull()
    })

    test('should handle exceptions in authentication', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => {
            throw new Error('Header access error')
          })
        }
      }

      const result = await verifyApiKey(mockRequest)
      expect(result).not.toBeNull()
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to verify API key' },
        { status: 500 }
      )
    })
  })

  describe('Performance', () => {
    let verifyApiKey

    beforeAll(async () => {
      const authModule = await import('../src/utilities/auth.ts')
      verifyApiKey = authModule.verifyApiKey
    })

    test('should complete authentication quickly', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'Authorization') return 'Bearer test-secret-key'
            return null
          })
        }
      }

      const start = Date.now()
      await verifyApiKey(mockRequest)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100) // Should complete in under 100ms
    })

    test('should handle concurrent authentication requests', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header) => {
            if (header === 'Authorization') return 'Bearer test-secret-key'
            return null
          })
        }
      }

      const promises = Array(10).fill().map(() => verifyApiKey(mockRequest))
      
      const start = Date.now()
      const results = await Promise.all(promises)
      const duration = Date.now() - start

      expect(results.every(r => r === null)).toBe(true) // All should succeed
      expect(duration).toBeLessThan(500) // Should complete quickly
    })
  })
})
