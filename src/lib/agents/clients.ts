// FlowMasters AI Agents - Service Clients
// Generated with AI assistance for rapid development

import { OpenAI } from 'openai'
import type { 
  AgentRequest, 
  AgentResponse, 
  SearchQuery, 
  SearchResult,
  WorkflowTemplate 
} from './types'

/**
 * Unified client for all AI services used by FlowMasters agents
 */
export class AgentClients {
  private static instance: AgentClients
  private openai: OpenAI
  
  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })
  }

  public static getInstance(): AgentClients {
    if (!AgentClients.instance) {
      AgentClients.instance = new AgentClients()
    }
    return AgentClients.instance
  }

  /**
   * Generate embeddings for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      })
      
      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw new Error('Failed to generate embedding')
    }
  }

  /**
   * Search documents in Qdrant vector database
   */
  async searchDocuments(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const embedding = await this.generateEmbedding(query.query)
      
      const response = await fetch(`${process.env.QDRANT_URL}/collections/flowmasters_docs/points/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.QDRANT_API_KEY || '',
        },
        body: JSON.stringify({
          vector: embedding,
          limit: query.limit || 5,
          score_threshold: query.threshold || 0.7,
          with_payload: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Qdrant search failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.result.map((item: any) => ({
        id: item.id,
        title: item.payload.title || 'Untitled',
        content: item.payload.content || '',
        url: item.payload.url,
        score: item.score,
        metadata: {
          type: item.payload.type || 'document',
          source: item.payload.source || 'unknown',
          lastUpdated: new Date(item.payload.lastUpdated || Date.now()),
          tags: item.payload.tags || [],
        },
      }))
    } catch (error) {
      console.error('Error searching documents:', error)
      return []
    }
  }

  /**
   * Trigger n8n workflow
   */
  async triggerWorkflow(workflowId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${process.env.N8N_API_URL}/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': process.env.N8N_API_KEY || '',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`n8n workflow execution failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error triggering n8n workflow:', error)
      throw new Error('Failed to execute workflow')
    }
  }

  /**
   * Get workflow templates from n8n
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const response = await fetch(`${process.env.N8N_API_URL}/workflows`, {
        headers: {
          'X-N8N-API-KEY': process.env.N8N_API_KEY || '',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.statusText}`)
      }

      const workflows = await response.json()
      
      return workflows.data.map((workflow: any) => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || '',
        category: workflow.tags?.[0] || 'general',
        difficulty: this.inferDifficulty(workflow),
        estimatedTime: this.estimateExecutionTime(workflow),
        triggers: workflow.nodes?.filter((node: any) => node.type.includes('trigger')) || [],
        actions: workflow.nodes?.filter((node: any) => !node.type.includes('trigger')) || [],
        variables: this.extractVariables(workflow),
      }))
    } catch (error) {
      console.error('Error fetching workflow templates:', error)
      return []
    }
  }

  /**
   * Index content using Crawl4AI
   */
  async indexContent(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.CRAWL4AI_API_URL}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          extract_content: true,
          generate_embeddings: true,
          store_in_qdrant: true,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Error indexing content:', error)
      return false
    }
  }

  /**
   * Generate AI response using OpenAI
   */
  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    context?: any
  ): Promise<string> {
    try {
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userMessage },
      ]

      if (context) {
        messages.splice(1, 0, {
          role: 'system' as const,
          content: `Context: ${JSON.stringify(context)}`,
        })
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      })

      return response.choices[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('Error generating AI response:', error)
      throw new Error('Failed to generate response')
    }
  }

  // Helper methods
  private inferDifficulty(workflow: any): 'beginner' | 'intermediate' | 'advanced' {
    const nodeCount = workflow.nodes?.length || 0
    if (nodeCount <= 3) return 'beginner'
    if (nodeCount <= 7) return 'intermediate'
    return 'advanced'
  }

  private estimateExecutionTime(workflow: any): number {
    const nodeCount = workflow.nodes?.length || 0
    return Math.max(30, nodeCount * 15) // seconds
  }

  private extractVariables(workflow: any): any[] {
    // Extract variables from workflow nodes
    const variables: any[] = []
    
    workflow.nodes?.forEach((node: any) => {
      if (node.parameters) {
        Object.keys(node.parameters).forEach(key => {
          if (typeof node.parameters[key] === 'string' && 
              node.parameters[key].includes('{{')) {
            variables.push({
              name: key,
              type: 'string',
              description: `Parameter for ${node.name}`,
              required: true,
            })
          }
        })
      }
    })

    return variables
  }
}

/**
 * Singleton instance for easy access
 */
export const agentClients = AgentClients.getInstance()