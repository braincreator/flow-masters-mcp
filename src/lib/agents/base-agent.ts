// FlowMasters AI Agents - Base Agent Class
// Generated with AI assistance for rapid development

import { agentClients } from './clients'
import { vertexAIClient } from './vertex-ai-client'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import type { 
  AgentRequest, 
  AgentResponse, 
  AgentType, 
  AgentError,
  ResponseMetadata 
} from './types'

/**
 * Abstract base class for all FlowMasters AI agents
 * Provides common functionality and enforces consistent interface
 */
export abstract class BaseAgent {
  protected agentType: AgentType
  protected name: string
  protected description: string
  protected systemPrompt: string
  protected maxTokens: number
  protected temperature: number

  constructor(
    agentType: AgentType,
    name: string,
    description: string,
    systemPrompt: string,
    options: {
      maxTokens?: number
      temperature?: number
    } = {}
  ) {
    this.agentType = agentType
    this.name = name
    this.description = description
    this.systemPrompt = systemPrompt
    this.maxTokens = options.maxTokens || 4000
    this.temperature = options.temperature || 0.7
  }

  /**
   * Main processing method - must be implemented by each agent
   */
  abstract process(request: AgentRequest): Promise<AgentResponse>

  /**
   * Generate AI response using the agent's system prompt
   * Now uses Google Vertex AI with Gemini models
   */
  protected async generateResponse(
    userMessage: string,
    context?: any,
    options: {
      model?: 'gemini-2.5-flash' | 'gemini-2.5-flash-vision' | 'gemini-ultra'
      temperature?: number
      stream?: boolean
    } = {}
  ): Promise<string> {
    const startTime = Date.now()
    
    try {
      // Use Vertex AI client instead of OpenAI
      const response = await vertexAIClient.generateResponse(
        this.systemPrompt,
        userMessage,
        context,
        {
          model: options.model || 'gemini-2.5-flash',
          temperature: options.temperature || this.temperature,
          maxTokens: this.maxTokens,
          stream: options.stream || false,
        }
      )
      
      const processingTime = Date.now() - startTime
      
      // Log performance metrics
      this.logMetrics({
        agentType: this.agentType,
        processingTime,
        success: true,
        model: options.model || 'gemini-2.5-flash',
      })

      return response
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      this.logMetrics({
        agentType: this.agentType,
        processingTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  }

  /**
   * Create standardized response object
   */
  protected createResponse(
    content: string,
    options: {
      type?: AgentResponse['type']
      data?: any
      sources?: AgentResponse['sources']
      suggestions?: string[]
      actions?: AgentResponse['actions']
      metadata?: Partial<ResponseMetadata>
    } = {}
  ): AgentResponse {
    return {
      type: options.type || 'text',
      content,
      data: options.data,
      sources: options.sources,
      suggestions: options.suggestions,
      actions: options.actions,
      metadata: {
        processingTime: 0,
        tokensUsed: 0,
        confidence: 0.8,
        sources: options.sources?.length || 0,
        ...options.metadata,
      },
    }
  }

  /**
   * Create standardized error response
   */
  protected createErrorResponse(
    error: string | Error,
    code: string = 'AGENT_ERROR'
  ): AgentResponse {
    const errorMessage = error instanceof Error ? error.message : error
    
    return {
      type: 'error',
      content: `Извините, произошла ошибка: ${errorMessage}`,
      metadata: {
        processingTime: 0,
        tokensUsed: 0,
        confidence: 0,
        sources: 0,
      },
    }
  }

  /**
   * Log interaction for analytics and debugging
   */
  protected async logInteraction(
    request: AgentRequest,
    response: AgentResponse,
    error?: AgentError
  ): Promise<void> {
    try {
      const logData = {
        agentType: this.agentType,
        userId: request.userId,
        sessionId: request.sessionId,
        query: request.message,
        response: response.content,
        processingTime: response.metadata?.processingTime || 0,
        success: response.type !== 'error',
        error: error ? {
          code: error.code,
          message: error.message,
        } : null,
        timestamp: new Date(),
      }

      // In a real implementation, this would save to database
      logDebug('[Agent Interaction]', logData)
      
      // TODO: Save to MongoDB via Payload CMS
      // await payload.create({
      //   collection: 'agent-interactions',
      //   data: logData
      // })
    } catch (logError) {
      logError('Failed to log interaction:', logError)
    }
  }

  /**
   * Log performance metrics
   */
  private logMetrics(metrics: {
    agentType: AgentType
    processingTime: number
    success: boolean
    error?: string
    model?: string
  }): void {
    logDebug('[Agent Metrics]', {
      ...metrics,
      timestamp: new Date().toISOString(),
      provider: 'vertex-ai',
    })
  }

  /**
   * Validate request before processing
   */
  protected validateRequest(request: AgentRequest): void {
    if (!request.message || request.message.trim().length === 0) {
      throw new Error('Message is required')
    }

    if (request.message.length > 10000) {
      throw new Error('Message is too long (max 10000 characters)')
    }
  }

  /**
   * Extract user context for personalization
   */
  protected extractUserContext(request: AgentRequest): any {
    return {
      userId: request.userId,
      sessionId: request.sessionId,
      preferences: request.context?.preferences,
      businessContext: request.context?.businessContext,
      currentPage: request.context?.currentPage,
      previousInteractions: request.context?.previousInteractions?.slice(-5), // Last 5 interactions
    }
  }

  /**
   * Generate contextual suggestions based on agent type
   */
  protected generateSuggestions(request: AgentRequest): string[] {
    // Base suggestions - can be overridden by specific agents
    return [
      'Расскажите больше об этом',
      'Покажите пример',
      'Как это настроить?',
      'Есть ли альтернативы?',
    ]
  }

  /**
   * Get agent information
   */
  public getInfo() {
    return {
      type: this.agentType,
      name: this.name,
      description: this.description,
      capabilities: this.getCapabilities(),
    }
  }

  /**
   * Get agent capabilities - should be overridden by specific agents
   */
  protected getCapabilities(): string[] {
    return ['text_generation', 'context_awareness']
  }
}