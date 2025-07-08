/**
 * MCP Tool Definitions for Flow Masters API
 *
 * This file contains comprehensive tool definitions that follow the MCP protocol
 * and provide clear, LLM-friendly documentation for all available tools.
 */

export interface MCPTool {
  name: string
  description: string
  purpose: string
  useCases: string[]
  triggerConditions: string[]
  inputSchema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
  outputSchema: {
    type: string
    properties: Record<string, any>
  }
  examples: Array<{
    description: string
    input: any
    output: any
  }>
  errorHandling: {
    commonErrors: Array<{
      code: string
      message: string
      resolution: string
    }>
  }
}

export const mcpTools: MCPTool[] = [
  {
    name: 'get_api_health',
    description: 'Check the health status of the Flow Masters API and MCP server connection',
    purpose: 'Verify that the API is accessible and the MCP server can communicate with it',
    useCases: [
      'Troubleshooting connection issues',
      'Monitoring API availability',
      'Verifying setup before making API calls',
      'Health checks for automated systems',
    ],
    triggerConditions: [
      'When user reports API connection issues',
      'Before making critical API operations',
      'During system diagnostics',
      'When setting up new integrations',
    ],
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Whether the API is healthy' },
        version: { type: 'string', description: 'MCP server version' },
        message: { type: 'string', description: 'Status message' },
        endpointsCount: { type: 'number', description: 'Number of available API endpoints' },
        apiConfig: {
          type: 'object',
          properties: {
            basePath: { type: 'string', description: 'API base path' },
            apiVersion: { type: 'string', description: 'API version' },
          },
        },
      },
    },
    examples: [
      {
        description: 'Check API health status',
        input: {},
        output: {
          success: true,
          version: '2.0.0',
          message: 'MCP сервер работает нормально',
          endpointsCount: 45,
          apiConfig: {
            basePath: '/api',
            apiVersion: 'v1',
          },
        },
      },
    ],
    errorHandling: {
      commonErrors: [
        {
          code: 'CONNECTION_FAILED',
          message: 'Cannot connect to Flow Masters API',
          resolution: 'Check API URL, network connectivity, and API key configuration',
        },
        {
          code: 'AUTHENTICATION_FAILED',
          message: 'API key authentication failed',
          resolution: 'Verify API key is valid and has proper permissions',
        },
      ],
    },
  },
  {
    name: 'get_api_endpoints',
    description:
      'Retrieve a comprehensive list of all available Flow Masters API endpoints with their documentation',
    purpose: 'Provide LLMs with complete API endpoint information for making informed API calls',
    useCases: [
      'Discovering available API functionality',
      'Finding the right endpoint for a specific task',
      'Understanding API capabilities',
      'Building API integrations',
      'Searching for specific functionality',
    ],
    triggerConditions: [
      'When user asks about available API features',
      'When planning API integrations',
      'When searching for specific functionality',
      'When documenting API capabilities',
    ],
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional search query to filter endpoints by name, path, or description',
          examples: ['users', 'auth', 'courses', 'payments'],
        },
      },
      required: [],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        endpoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'API endpoint path' },
              method: { type: 'string', description: 'HTTP method' },
              description: { type: 'string', description: 'Endpoint description' },
              parameters: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    in: { type: 'string', enum: ['query', 'path', 'body', 'header'] },
                    required: { type: 'boolean' },
                    type: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
              security: { type: 'boolean', description: 'Whether authentication is required' },
              tags: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        totalEndpoints: { type: 'number' },
        query: { type: 'string', description: 'Applied search query' },
      },
    },
    examples: [
      {
        description: 'Get all available endpoints',
        input: {},
        output: {
          success: true,
          endpoints: [
            {
              path: '/api/v1/users',
              method: 'GET',
              description: 'Get list of users with pagination',
              parameters: [
                {
                  name: 'page',
                  in: 'query',
                  required: false,
                  type: 'number',
                  description: 'Page number for pagination',
                },
              ],
              security: true,
              tags: ['users', 'authentication'],
            },
          ],
          totalEndpoints: 45,
        },
      },
      {
        description: 'Search for user-related endpoints',
        input: { query: 'users' },
        output: {
          success: true,
          endpoints: [
            {
              path: '/api/v1/users',
              method: 'GET',
              description: 'Get list of users',
              security: true,
              tags: ['users'],
            },
            {
              path: '/api/v1/users/{id}',
              method: 'GET',
              description: 'Get user by ID',
              security: true,
              tags: ['users'],
            },
          ],
          totalEndpoints: 3,
          query: 'users',
        },
      },
    ],
    errorHandling: {
      commonErrors: [
        {
          code: 'ENDPOINTS_NOT_LOADED',
          message: 'API endpoints not yet loaded',
          resolution: 'Wait for endpoint discovery to complete or refresh endpoints',
        },
      ],
    },
  },
  {
    name: 'refresh_api_endpoints',
    description: 'Force refresh the cached list of API endpoints from the Flow Masters API',
    purpose: 'Update the endpoint cache when new API features are deployed',
    useCases: [
      'After API updates or deployments',
      'When endpoints seem outdated',
      'Troubleshooting missing endpoints',
      'Ensuring latest API documentation',
    ],
    triggerConditions: [
      'When user reports missing API endpoints',
      'After known API deployments',
      'When endpoint information seems stale',
      'During system maintenance',
    ],
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        endpointsCount: { type: 'number', description: 'Number of endpoints after refresh' },
      },
    },
    examples: [
      {
        description: 'Refresh endpoint cache',
        input: {},
        output: {
          success: true,
          message: 'Эндпоинты успешно обновлены',
          endpointsCount: 47,
        },
      },
    ],
    errorHandling: {
      commonErrors: [
        {
          code: 'REFRESH_FAILED',
          message: 'Failed to refresh endpoints',
          resolution: 'Check API connectivity and authentication',
        },
      ],
    },
  },
  {
    name: 'get_model_context',
    description:
      'Get contextual information and suggestions for LLM interactions with Flow Masters API',
    purpose: 'Provide intelligent context and recommendations for API usage based on user queries',
    useCases: [
      'Getting smart suggestions for API calls',
      'Understanding complex API workflows',
      'Finding relevant endpoints for specific tasks',
      'Getting context-aware API documentation',
      'Optimizing API usage patterns',
    ],
    triggerConditions: [
      'When user asks complex questions about API usage',
      'When planning multi-step API workflows',
      'When user needs guidance on best practices',
      'When optimizing API integration strategies',
    ],
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query about what you want to accomplish',
          examples: [
            'How do I create a new user and enroll them in a course?',
            "What's the best way to handle payments for subscriptions?",
            'How can I get analytics data for my courses?',
          ],
        },
        model: {
          type: 'string',
          description: 'Optional model identifier for context optimization',
          examples: ['gpt-4', 'claude-3', 'gemini-pro'],
        },
        options: {
          type: 'object',
          properties: {
            maxTokens: { type: 'number', description: 'Maximum tokens in response' },
            temperature: { type: 'number', description: 'Response creativity level' },
            search: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Specific search query' },
                filters: { type: 'object', description: 'Additional filters' },
              },
            },
          },
        },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        context: { type: 'string', description: 'Contextual information and recommendations' },
        endpoints: {
          type: 'array',
          description: 'Relevant API endpoints for the query',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              method: { type: 'string' },
              description: { type: 'string' },
              relevance: { type: 'number', description: 'Relevance score 0-1' },
            },
          },
        },
        model: { type: 'string', description: 'Model used for context generation' },
        timestamp: { type: 'string', description: 'Response timestamp' },
      },
    },
    examples: [
      {
        description: 'Get context for user management workflow',
        input: {
          query: 'How do I create a new user and assign them to a course?',
          options: { maxTokens: 1000 },
        },
        output: {
          success: true,
          context:
            "To create a new user and assign them to a course, you'll need to: 1) Create user via POST /api/v1/users, 2) Enroll user in course via POST /api/v1/course-enrollments. Make sure to handle authentication and validate user data.",
          endpoints: [
            {
              path: '/api/v1/users',
              method: 'POST',
              description: 'Create new user',
              relevance: 0.95,
            },
            {
              path: '/api/v1/course-enrollments',
              method: 'POST',
              description: 'Enroll user in course',
              relevance: 0.9,
            },
          ],
          timestamp: '2024-01-15T10:30:00Z',
        },
      },
    ],
    errorHandling: {
      commonErrors: [
        {
          code: 'INVALID_QUERY',
          message: 'Query parameter is required',
          resolution: 'Provide a clear natural language query about what you want to accomplish',
        },
        {
          code: 'CONTEXT_GENERATION_FAILED',
          message: 'Failed to generate context',
          resolution: 'Try rephrasing your query or check if the LLM service is available',
        },
      ],
    },
  },
  {
    name: 'proxy_api_request',
    description:
      'Execute API requests to Flow Masters through the MCP proxy with automatic authentication',
    purpose:
      'Allow secure API calls through the MCP server with built-in authentication and error handling',
    useCases: [
      'Making authenticated API calls',
      'Testing API endpoints',
      'Executing complex API workflows',
      'Bypassing CORS restrictions',
      'Centralized API access with logging',
    ],
    triggerConditions: [
      'When direct API access is needed',
      'When testing specific API functionality',
      'When building API integrations',
      'When CORS prevents direct browser calls',
    ],
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          description: 'HTTP method for the request',
        },
        path: {
          type: 'string',
          description: 'API endpoint path (without base URL)',
          examples: ['/users', '/courses/123', '/enrollments'],
        },
        data: {
          type: 'object',
          description: 'Request body data for POST/PUT/PATCH requests',
        },
        params: {
          type: 'object',
          description: 'Query parameters as key-value pairs',
        },
        headers: {
          type: 'object',
          description: 'Additional headers (authentication is handled automatically)',
        },
      },
      required: ['method', 'path'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object', description: 'Response data from the API' },
        error: { type: 'string', description: 'Error message if request failed' },
        statusCode: { type: 'number', description: 'HTTP status code' },
        headers: { type: 'object', description: 'Response headers' },
      },
    },
    examples: [
      {
        description: 'Get list of users',
        input: {
          method: 'GET',
          path: '/users',
          params: { page: 1, limit: 10 },
        },
        output: {
          success: true,
          data: {
            users: [{ id: '1', name: 'John Doe', email: 'john@example.com' }],
            pagination: { page: 1, total: 100 },
          },
          statusCode: 200,
        },
      },
      {
        description: 'Create a new user',
        input: {
          method: 'POST',
          path: '/users',
          data: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'student',
          },
        },
        output: {
          success: true,
          data: {
            id: '123',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'student',
            createdAt: '2024-01-15T10:30:00Z',
          },
          statusCode: 201,
        },
      },
    ],
    errorHandling: {
      commonErrors: [
        {
          code: 'INVALID_METHOD',
          message: 'HTTP method not supported',
          resolution: 'Use one of: GET, POST, PUT, PATCH, DELETE',
        },
        {
          code: 'AUTHENTICATION_FAILED',
          message: 'API authentication failed',
          resolution: 'Check API key configuration and permissions',
        },
        {
          code: 'ENDPOINT_NOT_FOUND',
          message: 'API endpoint not found',
          resolution: 'Verify the endpoint path and check available endpoints',
        },
        {
          code: 'VALIDATION_ERROR',
          message: 'Request data validation failed',
          resolution: 'Check required fields and data types in request body',
        },
      ],
    },
  },
  {
    name: 'get_integrations',
    description: 'Retrieve available integrations and their configuration from Flow Masters',
    purpose: 'Discover and manage third-party integrations and services connected to Flow Masters',
    useCases: [
      'Listing available integrations',
      'Checking integration status',
      'Finding integration configuration options',
      'Troubleshooting integration issues',
      'Managing webhook configurations',
    ],
    triggerConditions: [
      'When user asks about available integrations',
      'When setting up new integrations',
      'When troubleshooting integration issues',
      'When managing webhook endpoints',
    ],
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Filter integrations by type',
          enum: ['webhook', 'email', 'crm', 'custom'],
          examples: ['webhook', 'email'],
        },
      },
      required: [],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string', enum: ['webhook', 'email', 'crm', 'custom'] },
              status: { type: 'string', enum: ['active', 'inactive'] },
              webhookUrl: { type: 'string' },
              triggers: { type: 'array' },
              actions: { type: 'array' },
              lastSync: { type: 'string' },
              lastSyncStatus: { type: 'string', enum: ['success', 'error'] },
            },
          },
        },
      },
    },
    examples: [
      {
        description: 'Get all integrations',
        input: {},
        output: {
          success: true,
          data: [
            {
              id: 'webhook-1',
              name: 'Course Completion Webhook',
              type: 'webhook',
              status: 'active',
              webhookUrl: 'https://example.com/webhook',
              triggers: ['course_completed'],
              lastSync: '2024-01-15T10:30:00Z',
              lastSyncStatus: 'success',
            },
          ],
        },
      },
      {
        description: 'Get webhook integrations only',
        input: { type: 'webhook' },
        output: {
          success: true,
          data: [
            {
              id: 'webhook-1',
              name: 'Course Completion Webhook',
              type: 'webhook',
              status: 'active',
            },
          ],
        },
      },
    ],
    errorHandling: {
      commonErrors: [
        {
          code: 'INVALID_TYPE',
          message: 'Invalid integration type specified',
          resolution: 'Use one of: webhook, email, crm, custom',
        },
        {
          code: 'ACCESS_DENIED',
          message: 'Insufficient permissions to view integrations',
          resolution: 'Check API key permissions for integration access',
        },
      ],
    },
  },
  {
    name: 'check_for_updates',
    description: 'Check for available updates to the MCP server and get update information',
    purpose:
      'Ensure the MCP server is running the latest version with security patches and new features',
    useCases: [
      'Checking for server updates',
      'Getting update notifications',
      'Planning maintenance windows',
      'Ensuring security compliance',
      'Accessing new features',
    ],
    triggerConditions: [
      'During routine maintenance checks',
      'When experiencing issues that might be fixed in updates',
      'When new features are needed',
      'For security compliance audits',
    ],
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        hasUpdate: { type: 'boolean', description: 'Whether an update is available' },
        currentVersion: { type: 'string', description: 'Current MCP server version' },
        latestVersion: { type: 'string', description: 'Latest available version' },
        updateInfo: {
          type: 'object',
          properties: {
            releaseNotes: { type: 'string' },
            downloadUrl: { type: 'string' },
            isSecurityUpdate: { type: 'boolean' },
            breakingChanges: { type: 'boolean' },
          },
        },
      },
    },
    examples: [
      {
        description: 'Check for updates',
        input: {},
        output: {
          success: true,
          hasUpdate: true,
          currentVersion: '2.0.0',
          latestVersion: '2.1.0',
          updateInfo: {
            releaseNotes: 'Added new tool discovery features and improved error handling',
            isSecurityUpdate: false,
            breakingChanges: false,
          },
        },
      },
    ],
    errorHandling: {
      commonErrors: [
        {
          code: 'UPDATE_CHECK_FAILED',
          message: 'Failed to check for updates',
          resolution: 'Check internet connectivity and update server availability',
        },
      ],
    },
  },
]

export const getToolByName = (name: string): MCPTool | undefined => {
  return mcpTools.find((tool) => tool.name === name)
}

export const searchTools = (query: string): MCPTool[] => {
  const lowerQuery = query.toLowerCase()
  return mcpTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.purpose.toLowerCase().includes(lowerQuery) ||
      tool.useCases.some((useCase) => useCase.toLowerCase().includes(lowerQuery)),
  )
}

export const getToolsMetadata = () => {
  return {
    totalTools: mcpTools.length,
    categories: [...new Set(mcpTools.flatMap((tool) => tool.useCases))],
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
  }
}
