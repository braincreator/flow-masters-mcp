// FlowMasters AI Agents - Google Vertex AI Client
// Generated with AI assistance for rapid development

import { GoogleAuth } from 'google-auth-library'
import { google } from '@ai-sdk/google'
import { generateText, generateObject, streamText } from 'ai'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import type { 
  AgentRequest, 
  AgentResponse, 
  SearchQuery, 
  SearchResult,
  WorkflowTemplate 
} from './types'

/**
 * Google Vertex AI client for FlowMasters agents
 * Supports Gemini Pro, Gemini Ultra, and other Google models
 */
export class VertexAIClient {
  private static instance: VertexAIClient
  private auth: GoogleAuth
  private projectId: string
  private location: string
  
  private constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'ancient-figure-462211-t6'
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    
    // Initialize Google Auth with service account
    this.auth = new GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/Users/braincreator/Projects/flow-masters/flow-masters/google-service-account.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: this.projectId,
    })
  }

  public static getInstance(): VertexAIClient {
    if (!VertexAIClient.instance) {
      VertexAIClient.instance = new VertexAIClient()
    }
    return VertexAIClient.instance
  }

  /**
   * Generate text response using Gemini Pro
   */
  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    context?: any,
    options: {
      model?: 'gemini-2.5-flash' | 'gemini-2.5-flash-vision' | 'gemini-ultra'
      temperature?: number
      maxTokens?: number
      stream?: boolean
    } = {}
  ): Promise<string> {
    try {
      const {
        model = 'gemini-2.5-flash',
        temperature = 0.7,
        maxTokens = 4000,
        stream = false
      } = options

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

      if (stream) {
        const result = await streamText({
          model: google(model),
          messages,
          temperature,
          maxTokens,
        })
        
        // For streaming, we need to collect the full response
        let fullResponse = ''
        for await (const chunk of result.textStream) {
          fullResponse += chunk
        }
        return fullResponse
      } else {
        const result = await generateText({
          model: google(model),
          messages,
          temperature,
          maxTokens,
        })

        return result.text
      }
    } catch (error) {
      logError('Error generating Vertex AI response:', error)
      throw new Error(`Vertex AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate embeddings using Vertex AI Text Embeddings
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const authClient = await this.auth.getClient()
      const accessToken = await authClient.getAccessToken()

      const response = await fetch(
        `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/textembedding-gecko:predict`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{ content: text }],
            parameters: {
              outputDimensionality: 768, // Standard embedding size
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Vertex AI embeddings failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.predictions[0].embeddings.values
    } catch (error) {
      logError('Error generating Vertex AI embedding:', error)
      throw new Error('Failed to generate embedding')
    }
  }

  /**
   * Generate structured response using Gemini with schema
   */
  async generateStructuredResponse<T>(
    prompt: string,
    schema: any,
    options: {
      model?: 'gemini-2.5-flash' | 'gemini-ultra'
      temperature?: number
    } = {}
  ): Promise<T> {
    try {
      const { model = 'gemini-2.5-flash', temperature = 0.3 } = options

      const result = await generateObject({
        model: google(model),
        prompt,
        schema,
        temperature,
      })

      return result.object as T
    } catch (error) {
      logError('Error generating structured response:', error)
      throw new Error('Failed to generate structured response')
    }
  }

  /**
   * Analyze image with Gemini Pro Vision
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    options: {
      temperature?: number
      maxTokens?: number
    } = {}
  ): Promise<string> {
    try {
      const { temperature = 0.7, maxTokens = 2000 } = options

      const result = await generateText({
        model: google('gemini-2.5-flash-vision'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', image: imageUrl },
            ],
          },
        ],
        temperature,
        maxTokens,
      })

      return result.text
    } catch (error) {
      logError('Error analyzing image:', error)
      throw new Error('Failed to analyze image')
    }
  }

  /**
   * Search documents in Qdrant using Vertex AI embeddings
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
      logError('Error searching documents with Vertex AI:', error)
      return []
    }
  }

  /**
   * Trigger n8n workflow (unchanged)
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
      logError('Error triggering n8n workflow:', error)
      throw new Error('Failed to execute workflow')
    }
  }

  /**
   * Get workflow templates from n8n (unchanged)
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
      logError('Error fetching workflow templates:', error)
      return []
    }
  }

  /**
   * Index content using Crawl4AI (unchanged)
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
          embedding_provider: 'vertex-ai', // Use Vertex AI for embeddings
        }),
      })

      return response.ok
    } catch (error) {
      logError('Error indexing content:', error)
      return false
    }
  }

  /**
   * Translate text using Google Cloud Translation
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> {
    try {
      const authClient = await this.auth.getClient()
      const accessToken = await authClient.getAccessToken()

      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            source: sourceLanguage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data.translations[0].translatedText
    } catch (error) {
      logError('Error translating text:', error)
      return text // Return original text if translation fails
    }
  }

  // Helper methods (unchanged)
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
export const vertexAIClient = VertexAIClient.getInstance()