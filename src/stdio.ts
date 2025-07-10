#!/usr/bin/env node

/**
 * Flow Masters MCP Server - STDIO Version
 * 
 * This version supports the standard MCP stdio protocol for integration
 * with Cursor, Claude Desktop, and other MCP clients.
 */

import { toolDiscovery } from './tools/discovery'
import { ApiClient } from './api/client'
import { MCPServerConfig } from './types'

// Parse command line arguments
function parseArgs(): { apiKey?: string; apiUrl?: string; basePath?: string; apiVersion?: string } {
  const args = process.argv.slice(2)
  const config: any = {}
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    if (arg.startsWith('--api-key=')) {
      config.apiKey = arg.split('=')[1]
    } else if (arg.startsWith('--api-url=')) {
      config.apiUrl = arg.split('=')[1]
    } else if (arg.startsWith('--base-path=')) {
      config.basePath = arg.split('=')[1]
    } else if (arg.startsWith('--api-version=')) {
      config.apiVersion = arg.split('=')[1]
    } else if (arg === '--stdio') {
      // Standard MCP stdio flag - we support this
      continue
    }
  }
  
  return config
}

// Create configuration from args and environment
function createConfig(): MCPServerConfig {
  const args = parseArgs()
  
  return {
    port: 3030, // Not used in stdio mode
    host: 'localhost', // Not used in stdio mode
    apiConfig: {
      apiUrl: args.apiUrl || process.env.API_URL || 'http://localhost:3000',
      apiKey: args.apiKey || process.env.API_KEY || '',
      autoUpdate: process.env.AUTO_UPDATE === 'true',
      updateCheckInterval: parseInt(process.env.UPDATE_CHECK_INTERVAL || '60', 10),
      basePath: args.basePath || process.env.API_BASE_PATH || '/api',
      apiVersion: args.apiVersion || process.env.API_VERSION || 'v1',
    },
    llm: {
      modelContextEnabled: process.env.MODEL_CONTEXT_ENABLED !== 'false',
      allowedModels: process.env.ALLOWED_MODELS ? process.env.ALLOWED_MODELS.split(',') : '*',
      maxTokens: parseInt(process.env.MAX_TOKENS || '8192', 10),
      contextWindow: parseInt(process.env.CONTEXT_WINDOW || '4096', 10),
      caching: {
        enabled: process.env.CACHE_ENABLED !== 'false',
        ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
      },
    },
  }
}

// MCP Protocol Message Types
interface MCPRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: any
}

interface MCPResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

interface MCPNotification {
  jsonrpc: '2.0'
  method: string
  params?: any
}

class MCPStdioServer {
  private config: MCPServerConfig
  private apiClient: ApiClient

  constructor(config: MCPServerConfig) {
    this.config = config
    this.apiClient = new ApiClient(config.apiConfig)
  }

  async start() {
    // Send initialization notification
    this.sendNotification('initialized', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
        logging: {}
      },
      serverInfo: {
        name: 'Flow Masters MCP Server',
        version: '2.0.0'
      }
    })

    // Listen for stdin messages
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (data) => {
      const lines = data.toString().trim().split('\n')
      for (const line of lines) {
        if (line.trim()) {
          this.handleMessage(line.trim())
        }
      }
    })

    // Handle process termination
    process.on('SIGINT', () => {
      this.sendNotification('shutdown', {})
      process.exit(0)
    })
  }

  private async handleMessage(message: string) {
    try {
      const request: MCPRequest = JSON.parse(message)
      
      switch (request.method) {
        case 'initialize':
          await this.handleInitialize(request)
          break
        case 'tools/list':
          await this.handleToolsList(request)
          break
        case 'tools/call':
          await this.handleToolCall(request)
          break
        case 'resources/list':
          await this.handleResourcesList(request)
          break
        case 'prompts/list':
          await this.handlePromptsList(request)
          break
        default:
          this.sendError(request.id, -32601, `Method not found: ${request.method}`)
      }
    } catch (error) {
      console.error('Error handling message:', error)
      this.sendError('unknown', -32700, 'Parse error')
    }
  }

  private async handleInitialize(request: MCPRequest) {
    this.sendResponse(request.id, {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
        logging: {}
      },
      serverInfo: {
        name: 'Flow Masters MCP Server',
        version: '2.0.0'
      }
    })
  }

  private async handleToolsList(request: MCPRequest) {
    const toolsResult = toolDiscovery.getAllTools()
    
    if (toolsResult.success && toolsResult.tools) {
      const mcpTools = toolsResult.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
      
      this.sendResponse(request.id, { tools: mcpTools })
    } else {
      this.sendError(request.id, -32603, 'Failed to get tools list')
    }
  }

  private async handleToolCall(request: MCPRequest) {
    const { name, arguments: args } = request.params
    
    try {
      let result: any
      
      switch (name) {
        case 'get_api_health':
          const isConnected = await this.apiClient.testConnection()
          result = {
            success: isConnected,
            version: '2.0.0',
            message: isConnected ? 'API is healthy' : 'API connection failed',
            apiConfig: {
              basePath: this.config.apiConfig.basePath,
              apiVersion: this.config.apiConfig.apiVersion
            }
          }
          break
          
        case 'get_api_endpoints':
          const endpointsResult = await this.apiClient.getApiEndpoints()
          result = endpointsResult
          break
          
        case 'proxy_api_request':
          const { method, path, data, params, headers } = args
          result = await this.apiClient.request(method, path, data, params, headers)
          break
          
        case 'get_integrations':
          const integrationsResult = await this.apiClient.getIntegrations(args.type)
          result = integrationsResult
          break
          
        default:
          this.sendError(request.id, -32601, `Tool not found: ${name}`)
          return
      }
      
      this.sendResponse(request.id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] })
    } catch (error) {
      this.sendError(request.id, -32603, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleResourcesList(request: MCPRequest) {
    this.sendResponse(request.id, { resources: [] })
  }

  private async handlePromptsList(request: MCPRequest) {
    this.sendResponse(request.id, { prompts: [] })
  }

  private sendResponse(id: string | number, result: any) {
    const response: MCPResponse = {
      jsonrpc: '2.0',
      id,
      result
    }
    process.stdout.write(JSON.stringify(response) + '\n')
  }

  private sendError(id: string | number, code: number, message: string, data?: any) {
    const response: MCPResponse = {
      jsonrpc: '2.0',
      id,
      error: { code, message, data }
    }
    process.stdout.write(JSON.stringify(response) + '\n')
  }

  private sendNotification(method: string, params?: any) {
    const notification: MCPNotification = {
      jsonrpc: '2.0',
      method,
      params
    }
    process.stdout.write(JSON.stringify(notification) + '\n')
  }
}

// Main execution
async function main() {
  const config = createConfig()
  
  if (!config.apiConfig.apiKey) {
    console.error('Error: API key is required. Use --api-key=your-key or set API_KEY environment variable.')
    process.exit(1)
  }
  
  const server = new MCPStdioServer(config)
  await server.start()
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Failed to start MCP server:', error)
    process.exit(1)
  })
}

export { MCPStdioServer, createConfig }
