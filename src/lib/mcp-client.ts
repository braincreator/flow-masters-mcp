/**
 * MCP Client - Client for communicating with the Model Context Protocol server
 */

// Default MCP server URL - use proxy for client-side requests
const IS_SERVER = typeof window === 'undefined'
const MCP_URL = IS_SERVER
  ? process.env.NEXT_PUBLIC_MCP_URL || 'http://localhost:3030'
  : '/api/mcp-proxy'

/**
 * MCP API Client for interacting with the Model Context Protocol server
 */
export class MCPClient {
  private baseUrl: string

  constructor(baseUrl: string = MCP_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Get MCP server health status
   */
  async getHealth() {
    return this.fetchJson('/mcp/health')
  }

  /**
   * Get MCP server version information
   */
  async getVersion() {
    return this.fetchJson('/mcp/version')
  }

  /**
   * Get all available endpoints
   */
  async getAllEndpoints() {
    return this.fetchJson('/mcp/endpoints')
  }

  /**
   * Search endpoints by query
   */
  async searchEndpoints(query: string) {
    return this.fetchJson(`/mcp/endpoints?query=${encodeURIComponent(query)}`)
  }

  /**
   * Refresh endpoints list
   */
  async refreshEndpoints() {
    return this.fetchJson('/mcp/endpoints/refresh')
  }

  /**
   * Get available integrations
   */
  async getIntegrations(type?: string) {
    const url = type ? `/mcp/integrations?type=${encodeURIComponent(type)}` : '/mcp/integrations'
    return this.fetchJson(url)
  }

  /**
   * Check for MCP updates
   */
  async checkUpdates() {
    return this.fetchJson('/mcp/check-update')
  }

  /**
   * Helper method to fetch JSON from MCP server
   */
  private async fetchJson(path: string, options: RequestInit = {}) {
    try {
      // For client-side requests, use the proxy endpoint with path as a query parameter
      let url = ''
      if (!IS_SERVER && this.baseUrl === '/api/mcp-proxy') {
        url = `${this.baseUrl}?path=${encodeURIComponent(path)}`
      } else {
        url = `${this.baseUrl}${path}`
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`MCP request failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('MCP client error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send a request to an endpoint via MCP proxy
   */
  async proxyRequest(method: string, path: string, data?: any) {
    try {
      // Use our own proxy endpoint for client-side requests
      const url = IS_SERVER ? `${this.baseUrl}/mcp/proxy` : '/api/mcp-proxy'

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          path,
          data,
        }),
      })

      if (!response.ok) {
        throw new Error(`MCP proxy request failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('MCP proxy error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Export a default instance
export const mcpClient = new MCPClient()
