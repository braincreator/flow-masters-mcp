// Smart Documentation Search Agent
// Generated with AI assistance for rapid development

import { BaseAgent } from '../base-agent'
import { agentClients } from '../clients'
import { vertexAIClient } from '../vertex-ai-client'
import type { AgentRequest, AgentResponse, SearchQuery } from '../types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Smart Documentation Search Agent
 * Provides intelligent search through FlowMasters documentation using RAG
 */
export class SmartDocumentationSearchAgent extends BaseAgent {
  constructor() {
    super(
      'search',
      'Smart Documentation Search',
      'Умный поиск по документации FlowMasters с использованием AI',
      `Вы - эксперт по поиску и анализу документации FlowMasters. Ваша задача - находить наиболее релевантную информацию и предоставлять точные ответы с указанием источников.

ВАШИ ВОЗМОЖНОСТИ:
1. Векторный поиск по всей документации платформы
2. Анализ и синтез информации из множественных источников
3. Предоставление точных ответов с ссылками на источники
4. Предложение связанных тем и дополнительных ресурсов
5. Адаптация ответов под уровень технических знаний пользователя

ИСТОЧНИКИ ДАННЫХ:
- Официальная документация FlowMasters
- Руководства пользователя
- API документация
- FAQ и часто задаваемые вопросы
- Tutorials и примеры использования
- Документация интегрированных сервисов (n8n, OpenWebUI, Flowise)

ФОРМАТ ОТВЕТОВ:
1. Краткий прямой ответ на вопрос
2. Подробное объяснение с примерами
3. Ссылки на источники информации
4. Предложения связанных тем
5. Следующие рекомендуемые шаги

ВАЖНО:
- Всегда указывайте источники информации
- Если информация не найдена, честно об этом сообщайте
- Предлагайте альтернативные поисковые запросы
- Адаптируйте техническую сложность под пользователя`,
      {
        maxTokens: 4000,
        temperature: 0.3, // Lower temperature for more precise search results
      }
    )
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now()
    
    try {
      // Validate request
      this.validateRequest(request)
      
      // Create search query
      const searchQuery: SearchQuery = {
        query: request.message,
        limit: 5,
        threshold: 0.7,
        filters: this.extractSearchFilters(request),
      }

      // Perform vector search using Vertex AI embeddings
      const searchResults = await vertexAIClient.searchDocuments(searchQuery)
      
      if (searchResults.length === 0) {
        return this.createNoResultsResponse(request.message)
      }

      // Generate AI response based on search results
      const context = {
        searchResults,
        userQuery: request.message,
        userContext: this.extractUserContext(request),
      }

      const content = await this.generateSearchBasedResponse(
        request.message,
        context
      )

      // Generate related suggestions
      const suggestions = this.generateSearchSuggestions(request.message, searchResults)
      
      // Create actions for found documents
      const actions = this.createDocumentActions(searchResults)

      const response = this.createResponse(content, {
        type: 'search_results',
        data: {
          results: searchResults,
          totalFound: searchResults.length,
          query: request.message,
        },
        sources: searchResults.map(result => ({
          id: result.id,
          title: result.title,
          url: result.url,
          excerpt: result.content.substring(0, 200) + '...',
          relevanceScore: result.score,
          type: result.metadata.type as any,
        })),
        suggestions,
        actions,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: this.calculateConfidence(searchResults),
          sources: searchResults.length,
        },
      })

      // Log interaction
      await this.logInteraction(request, response)

      return response
    } catch (error) {
      logError('Smart Documentation Search error:', error)
      return this.createErrorResponse(error)
    }
  }

  /**
   * Generate AI response based on search results
   */
  private async generateSearchBasedResponse(
    query: string,
    context: any
  ): Promise<string> {
    const searchContext = `
НАЙДЕННЫЕ ДОКУМЕНТЫ:
${context.searchResults.map((result: any, index: number) => `
${index + 1}. ${result.title}
   Релевантность: ${(result.score * 100).toFixed(1)}%
   Содержание: ${result.content.substring(0, 500)}...
   Источник: ${result.metadata.source}
`).join('\n')}

ЗАПРОС ПОЛЬЗОВАТЕЛЯ: ${query}

Проанализируйте найденные документы и дайте исчерпывающий ответ на вопрос пользователя. 
Обязательно укажите номера источников в формате [1], [2] и т.д.
Если в документах нет полного ответа, честно об этом сообщите.`

    return await this.generateResponse(query, searchContext)
  }

  /**
   * Extract search filters from request
   */
  private extractSearchFilters(request: AgentRequest) {
    const message = request.message.toLowerCase()
    const filters: any = {}

    // Detect document type preferences
    if (message.includes('api') || message.includes('апи')) {
      filters.type = ['api-reference']
    } else if (message.includes('tutorial') || message.includes('туториал') || message.includes('пример')) {
      filters.type = ['tutorial']
    } else if (message.includes('faq') || message.includes('частые вопросы')) {
      filters.type = ['faq']
    }

    // Detect service-specific searches
    if (message.includes('n8n')) {
      filters.source = ['n8n-docs']
    } else if (message.includes('flowise')) {
      filters.source = ['flowise-docs']
    } else if (message.includes('qdrant')) {
      filters.source = ['qdrant-docs']
    } else if (message.includes('openwebui')) {
      filters.source = ['openwebui-docs']
    }

    return filters
  }

  /**
   * Create response when no results found
   */
  private createNoResultsResponse(query: string): AgentResponse {
    const suggestions = [
      'Попробуйте более общие термины',
      'Проверьте правописание',
      'Используйте синонимы',
      'Разбейте сложный вопрос на части',
    ]

    const alternativeQueries = this.generateAlternativeQueries(query)

    return this.createResponse(
      `К сожалению, я не нашел документов, точно соответствующих вашему запросу "${query}".

Попробуйте:
${alternativeQueries.map(q => `• ${q}`).join('\n')}

Или обратитесь к FlowMasters Assistant для общих вопросов о платформе.`,
      {
        type: 'search_results',
        data: {
          results: [],
          totalFound: 0,
          query,
        },
        suggestions: alternativeQueries,
        actions: [
          {
            type: 'navigate',
            label: 'Задать вопрос Assistant',
            data: { page: '/agents/assistant' },
          },
        ],
      }
    )
  }

  /**
   * Generate alternative search queries
   */
  private generateAlternativeQueries(query: string): string[] {
    const alternatives = []
    const words = query.toLowerCase().split(' ')

    // Add more general terms
    if (words.length > 2) {
      alternatives.push(words.slice(0, 2).join(' '))
    }

    // Add specific service queries
    if (!query.includes('n8n') && (query.includes('автоматизация') || query.includes('workflow'))) {
      alternatives.push('n8n автоматизация')
    }

    if (!query.includes('ai') && (query.includes('чат') || query.includes('бот'))) {
      alternatives.push('AI чат-бот настройка')
    }

    // Add common variations
    alternatives.push(
      'начало работы FlowMasters',
      'настройка интеграций',
      'создание workflow'
    )

    return alternatives.slice(0, 4)
  }

  /**
   * Generate search suggestions based on results
   */
  private generateSearchSuggestions(query: string, results: any[]): string[] {
    const suggestions = []
    
    // Extract related topics from results
    const topics = new Set<string>()
    results.forEach(result => {
      result.metadata.tags?.forEach((tag: string) => topics.add(tag))
    })

    // Convert topics to search suggestions
    Array.from(topics).slice(0, 3).forEach(topic => {
      suggestions.push(`Больше о ${topic}`)
    })

    // Add contextual suggestions
    if (query.includes('настройка')) {
      suggestions.push('Примеры конфигурации')
    }
    
    if (query.includes('интеграция')) {
      suggestions.push('Список доступных интеграций')
    }

    return suggestions.slice(0, 4)
  }

  /**
   * Create actions for found documents
   */
  private createDocumentActions(results: any[]) {
    const actions = []

    // Add action to view full document for top result
    if (results.length > 0 && results[0].url) {
      actions.push({
        type: 'open_documentation',
        label: 'Открыть полный документ',
        data: { url: results[0].url },
      })
    }

    // Add action to search related topics
    if (results.length > 0) {
      const relatedTags = results[0].metadata.tags?.slice(0, 2) || []
      if (relatedTags.length > 0) {
        actions.push({
          type: 'navigate',
          label: `Поиск по теме: ${relatedTags[0]}`,
          data: { 
            page: '/agents/search',
            query: relatedTags[0],
          },
        })
      }
    }

    return actions
  }

  /**
   * Calculate confidence score based on search results
   */
  private calculateConfidence(results: any[]): number {
    if (results.length === 0) return 0
    
    const avgScore = results.reduce((sum, result) => sum + result.score, 0) / results.length
    const topScore = results[0]?.score || 0
    
    // Confidence based on top result score and number of results
    return Math.min(0.95, (topScore * 0.7) + (Math.min(results.length / 5, 1) * 0.3))
  }

  /**
   * Get agent capabilities
   */
  protected getCapabilities(): string[] {
    return [
      'vector_search',
      'document_analysis',
      'source_attribution',
      'context_synthesis',
      'related_topic_discovery',
      'multilingual_search',
    ]
  }
}