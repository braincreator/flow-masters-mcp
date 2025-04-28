import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth';
import { ENV } from '@/constants/env'

/**
 * Proxy endpoint to communicate with the MCP server
 * This allows the frontend to access MCP endpoints without CORS issues
 */
export async function GET(request: NextRequest) {
  try {
    // Get the MCP URL from environment variables
    const mcpUrl = process.env.NEXT_PUBLIC_MCP_URL || 'http://localhost:3030'

    // Get the path from the query parameters
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
    }

    // Fetch data from MCP server with authentication
    const response = await fetch(`${mcpUrl}${path}`, {
      headers: {
        Authorization: `ApiKey ${ENV.PAYLOAD_SECRET}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('MCP proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication for POST requests
    const session = await getServerSession()

    // Only allow authenticated users for POST requests
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the MCP URL from environment variables
    const mcpUrl = process.env.NEXT_PUBLIC_MCP_URL || 'http://localhost:3030'

    // Parse the request body
    const body = await request.json()
    const { method, path, data } = body

    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
    }

    if (!method) {
      return NextResponse.json({ error: 'Method parameter is required' }, { status: 400 })
    }

    // For sensitive operations, require admin access
    if (path.includes('/refresh') || method !== 'GET') {
      // Check if user is admin
      if (!session.user.isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    // Prepare fetch options with authentication
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${ENV.PAYLOAD_SECRET}`,
      },
    }

    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data)
    }

    // Fetch data from MCP server
    const response = await fetch(`${mcpUrl}${path}`, fetchOptions)
    const responseData = await response.json()

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('MCP proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
