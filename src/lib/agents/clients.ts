// FlowMasters AI Agents - Service Clients
// Uses Google Vertex AI with service account or API key

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import type { 
  SearchQuery, 
  SearchResult,
  WorkflowTemplate 
} from './types'

/**
 * Unified client for all AI services used by FlowMasters agents
 */
export class AgentClients {
  private static instance: AgentClients
  private vertexModel: any
  
  private constructor() {
    // Initialize Google Vertex AI model
    // The @ai-sdk/google will automatically use environment variables:
    // - GOOGLE_GENERATIVE_AI_API_KEY (for API key auth)
    // - GOOGLE_APPLICATION_CREDENTIALS (for service account file path)
    // - Or service account JSON from GOOGLE_SERVICE_ACCOUNT_KEY
    this.vertexModel = google('gemini-2.5-flash')
  }

  public static getInstance(): AgentClients {
    if (!AgentClients.instance) {
      AgentClients.instance = new AgentClients()
    }
    return AgentClients.instance
  }

  /**
   * Generate AI response using Google Vertex AI
   */
  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    context?: any
  ): Promise<string> {
    try {
      // Check if any Google AI credentials are available
      const hasApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
      const hasServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS
      
      if (!hasApiKey && !hasServiceAccount) {
        throw new Error('Google AI credentials not found. Please set GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_SERVICE_ACCOUNT_KEY')
      }

      let prompt = systemPrompt + '\n\nUser: ' + userMessage
      
      if (context) {
        prompt += '\n\nContext: ' + JSON.stringify(context)
      }

      const { text } = await generateText({
        model: this.vertexModel,
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 4000,
      })

      return text || 'No response generated'
    } catch (error) {
      console.error('Error generating AI response:', error)
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search documents (mock implementation for now)
   */
  async searchDocuments(query: SearchQuery): Promise<SearchResult[]> {
    return [
      {
        id: '1',
        title: 'FlowMasters Documentation',
        content: `Результат поиска для: "${query.query}"`,
        url: 'https://flow-masters.ru/docs',
        score: 0.95,
        metadata: {
          type: 'document',
          source: 'flowmasters',
          lastUpdated: new Date(),
          tags: ['documentation', 'ai'],
        },
      }
    ]
  }

  /**
   * Get workflow templates (mock implementation)
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return [
      {
        id: 'template-1',
        name: 'Email Automation',
        description: 'Автоматическая отправка email уведомлений',
        category: 'communication',
        difficulty: 'beginner',
        estimatedTime: 60,
        triggers: [],
        actions: [],
        variables: [],
      }
    ]
  }
}

/**
 * Singleton instance for easy access
 */
export const agentClients = AgentClients.getInstance()
