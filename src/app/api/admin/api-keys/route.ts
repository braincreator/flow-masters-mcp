import { NextRequest, NextResponse } from 'next/server'
import { apiKeyService, CreateApiKeyData } from '@/services/apiKeyService'
import { verifyApiKey } from '@/utilities/auth'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

/**
 * GET - List API keys with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyApiKey(request)
    if (authResult) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    switch (action) {
      case 'list': {
        // Get query parameters
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const keyType = searchParams.get('keyType')
        const isEnabled = searchParams.get('isEnabled')
        const search = searchParams.get('search')

        // Build query
        const where: any = {}
        if (keyType) where.keyType = { equals: keyType }
        if (isEnabled !== null) where.isEnabled = { equals: isEnabled === 'true' }
        if (search) {
          where.or = [
            { name: { contains: search } },
            { description: { contains: search } },
          ]
        }

        // Get API keys from database
        const payload = await apiKeyService['getPayload']()
        const result = await payload.find({
          collection: 'apiKeys',
          where,
          page,
          limit,
          sort: '-createdAt',
        })

        // Remove sensitive data from response
        const sanitizedDocs = result.docs.map((doc: any) => ({
          ...doc,
          key: undefined, // Never return the actual key
          hashedKey: undefined, // Never return the hashed key
          keyPreview: doc.key ? `${doc.key.substring(0, 8)}...` : undefined,
        }))

        return NextResponse.json({
          success: true,
          data: {
            docs: sanitizedDocs,
            totalDocs: result.totalDocs,
            page: result.page,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
          }
        })
      }

      case 'statistics': {
        const stats = await apiKeyService.getKeyStatistics()
        return NextResponse.json({
          success: true,
          data: stats
        })
      }

      default: {
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
      }
    }
  } catch (error) {
    logError('API Keys GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * POST - Create new API key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyApiKey(request)
    if (authResult) {
      return authResult
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create': {
        const {
          name,
          description,
          keyType,
          permissions,
          allowedIPs,
          rateLimit,
          expiresAt,
          notes,
          tags
        } = body

        // Validate required fields
        if (!name || !keyType) {
          return NextResponse.json({
            success: false,
            error: 'Name and keyType are required'
          }, { status: 400 })
        }

        const createData: CreateApiKeyData = {
          name,
          description,
          keyType,
          permissions: permissions || ['read'],
          allowedIPs: allowedIPs || [],
          rateLimit: rateLimit || {
            enabled: true,
            requestsPerHour: 1000,
            requestsPerMinute: 60
          },
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          notes,
          tags: tags || []
        }

        const result = await apiKeyService.createApiKey(createData)

        if (result.success) {
          return NextResponse.json({
            success: true,
            data: {
              id: result.id,
              key: result.key, // Return key only once during creation
              message: 'API key created successfully'
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 400 })
        }
      }

      case 'rotate': {
        const { keyId } = body

        if (!keyId) {
          return NextResponse.json({
            success: false,
            error: 'keyId is required'
          }, { status: 400 })
        }

        const result = await apiKeyService.rotateApiKey(keyId)

        if (result.success) {
          return NextResponse.json({
            success: true,
            data: {
              newKey: result.newKey,
              message: 'API key rotated successfully'
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 400 })
        }
      }

      case 'disable': {
        const { keyId } = body

        if (!keyId) {
          return NextResponse.json({
            success: false,
            error: 'keyId is required'
          }, { status: 400 })
        }

        const result = await apiKeyService.disableApiKey(keyId)

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'API key disabled successfully'
          })
        } else {
          return NextResponse.json({
            success: false,
            error: result.error
          }, { status: 400 })
        }
      }

      case 'validate': {
        const { key, clientIP } = body

        if (!key) {
          return NextResponse.json({
            success: false,
            error: 'key is required'
          }, { status: 400 })
        }

        const result = await apiKeyService.validateApiKey(key, clientIP)

        return NextResponse.json({
          success: true,
          data: {
            isValid: result.isValid,
            permissions: result.permissions,
            rateLimit: result.rateLimit,
            error: result.error
          }
        })
      }

      default: {
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
      }
    }
  } catch (error) {
    logError('API Keys POST error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * PUT - Update API key
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyApiKey(request)
    if (authResult) {
      return authResult
    }

    const body = await request.json()
    const { keyId, ...updateData } = body

    if (!keyId) {
      return NextResponse.json({
        success: false,
        error: 'keyId is required'
      }, { status: 400 })
    }

    // Get payload instance
    const payload = await apiKeyService['getPayload']()

    // Update the API key (excluding sensitive fields)
    const allowedFields = [
      'name', 'description', 'keyType', 'permissions', 
      'allowedIPs', 'rateLimit', 'expiresAt', 'notes', 'tags', 'isEnabled'
    ]
    
    const filteredData: any = {}
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    }

    await payload.update({
      collection: 'apiKeys',
      id: keyId,
      data: filteredData
    })

    logInfo(`[API Keys] API key updated: ${keyId}`)

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully'
    })
  } catch (error) {
    logError('API Keys PUT error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * DELETE - Delete API key
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyApiKey(request)
    if (authResult) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json({
        success: false,
        error: 'keyId is required'
      }, { status: 400 })
    }

    // Get payload instance
    const payload = await apiKeyService['getPayload']()

    await payload.delete({
      collection: 'apiKeys',
      id: keyId
    })

    logInfo(`[API Keys] API key deleted: ${keyId}`)

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })
  } catch (error) {
    logError('API Keys DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
