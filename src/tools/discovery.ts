/**
 * MCP Tool Discovery Handler
 * 
 * Implements the MCP protocol tool discovery endpoints to provide
 * comprehensive tool documentation for LLM integration.
 */

import { mcpTools, getToolByName, searchTools, getToolsMetadata, MCPTool } from './definitions'

export interface MCPToolDiscoveryResponse {
  success: boolean
  tools?: MCPTool[]
  tool?: MCPTool
  metadata?: any
  error?: string
}

export class MCPToolDiscovery {
  /**
   * Get all available tools with their complete documentation
   */
  public getAllTools(): MCPToolDiscoveryResponse {
    try {
      return {
        success: true,
        tools: mcpTools,
        metadata: getToolsMetadata()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get a specific tool by name
   */
  public getToolByName(name: string): MCPToolDiscoveryResponse {
    try {
      const tool = getToolByName(name)
      if (!tool) {
        return {
          success: false,
          error: `Tool '${name}' not found`
        }
      }

      return {
        success: true,
        tool
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Search tools by query
   */
  public searchTools(query: string): MCPToolDiscoveryResponse {
    try {
      const tools = searchTools(query)
      return {
        success: true,
        tools,
        metadata: {
          query,
          resultsCount: tools.length,
          totalTools: mcpTools.length
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get tools metadata and statistics
   */
  public getToolsMetadata(): MCPToolDiscoveryResponse {
    try {
      return {
        success: true,
        metadata: getToolsMetadata()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get tools by category/use case
   */
  public getToolsByCategory(category: string): MCPToolDiscoveryResponse {
    try {
      const tools = mcpTools.filter(tool => 
        tool.useCases.some(useCase => 
          useCase.toLowerCase().includes(category.toLowerCase())
        )
      )

      return {
        success: true,
        tools,
        metadata: {
          category,
          resultsCount: tools.length,
          totalTools: mcpTools.length
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get MCP protocol-compliant tool list for LLM consumption
   * This format is optimized for LLM understanding and follows MCP standards
   */
  public getMCPProtocolTools(): any {
    try {
      const protocolTools = mcpTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        metadata: {
          purpose: tool.purpose,
          useCases: tool.useCases,
          triggerConditions: tool.triggerConditions,
          examples: tool.examples,
          errorHandling: tool.errorHandling
        }
      }))

      return {
        jsonrpc: "2.0",
        result: {
          tools: protocolTools,
          _meta: {
            protocol: "mcp",
            version: "1.0.0",
            server: "Flow Masters MCP Server",
            serverVersion: "2.0.0",
            capabilities: {
              tools: true,
              resources: true,
              prompts: false,
              logging: true
            },
            toolsCount: protocolTools.length,
            lastUpdated: new Date().toISOString()
          }
        }
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal error",
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  /**
   * Generate comprehensive tool documentation for LLMs
   * This provides detailed guidance on when and how to use each tool
   */
  public generateLLMGuidance(): string {
    try {
      let guidance = `# Flow Masters MCP Server - Tool Usage Guide for LLMs

This guide provides comprehensive information about available tools and when to use them.

## Available Tools (${mcpTools.length} total)

`

      mcpTools.forEach((tool, index) => {
        guidance += `
### ${index + 1}. ${tool.name}

**Purpose**: ${tool.purpose}

**Description**: ${tool.description}

**When to use this tool**:
${tool.triggerConditions.map(condition => `- ${condition}`).join('\n')}

**Use cases**:
${tool.useCases.map(useCase => `- ${useCase}`).join('\n')}

**Input Parameters**:
- Required: ${tool.inputSchema.required?.join(', ') || 'None'}
- Optional: ${Object.keys(tool.inputSchema.properties || {}).filter(key => !tool.inputSchema.required?.includes(key)).join(', ') || 'None'}

**Example Usage**:
${tool.examples.map(example => `
- **${example.description}**
  Input: \`${JSON.stringify(example.input, null, 2)}\`
  Output: \`${JSON.stringify(example.output, null, 2)}\`
`).join('\n')}

**Common Errors**:
${tool.errorHandling.commonErrors.map(error => `
- **${error.code}**: ${error.message}
  Resolution: ${error.resolution}
`).join('\n')}

---
`
      })

      guidance += `
## Best Practices for LLM Integration

1. **Always check API health first** using \`get_api_health\` before making other calls
2. **Use \`get_api_endpoints\`** to discover available functionality before making assumptions
3. **Use \`get_model_context\`** for complex queries that need intelligent guidance
4. **Use \`proxy_api_request\`** for actual API operations with proper error handling
5. **Refresh endpoints** using \`refresh_api_endpoints\` if you encounter missing functionality

## Error Handling Strategy

- Always check the \`success\` field in responses
- Use error codes to determine appropriate retry strategies
- Provide clear error messages to users based on error types
- Log errors for debugging and monitoring

## Security Considerations

- All API calls are automatically authenticated through the MCP server
- Never expose API keys or sensitive data in responses
- Use the proxy for all API operations to maintain security boundaries
`

      return guidance
    } catch (error) {
      return `Error generating LLM guidance: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Export singleton instance
export const toolDiscovery = new MCPToolDiscovery()
