// FlowMasters AI Agents - Service Clients
// Uses Google Generative AI (Gemini)

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
    // Initialize Google Generative AI model (Gemini)
    // API key will be read from GOOGLE_GENERATIVE_AI_API_KEY environment variable automatically
    this.vertexModel = google('gemini-pro')
  }

  public static getInstance(): AgentClients {
    if (!AgentClients.instance) {
      AgentClients.instance = new AgentClients()
    }
    return AgentClients.instance
  }

  /**
   * Generate AI response using Google Generative AI (Gemini)
   */
  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    context?: any
  ): Promise<string> {
    try {
      // Check if API key is available
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is required')
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
