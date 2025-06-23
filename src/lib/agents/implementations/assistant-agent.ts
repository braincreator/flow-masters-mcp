// FlowMasters Assistant Agent
// Generated with AI assistance for rapid development

import { BaseAgent } from '../base-agent'
import type { AgentRequest, AgentResponse } from '../types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * FlowMasters Assistant Agent
 * Provides general help and guidance about the FlowMasters platform
 */
export class FlowMastersAssistantAgent extends BaseAgent {
  constructor() {
    super(
      'assistant',
      'FlowMasters Assistant',
      'Ваш персональный помощник по платформе FlowMasters',
      `Вы - экспертный помощник по платформе FlowMasters, специализирующийся на AI-автоматизации бизнес-процессов.

КОНТЕКСТ ПЛАТФОРМЫ:
FlowMasters - это комплексная платформа для автоматизации бизнес-процессов с помощью AI, включающая:
- OpenWebUI: Интерфейс для работы с AI моделями
- n8n: Платформа для создания автоматизированных workflow
- Flowise: Визуальный конструктор AI workflow
- Qdrant: Векторная база данных для поиска и RAG
- Weaviate: AI-native векторная база данных
- Crawl4AI: Интеллектуальный веб-скрапинг
- Payload CMS: Система управления контентом

ВАШИ ВОЗМОЖНОСТИ:
1. Объяснение функций и возможностей платформы
2. Пошаговые инструкции по настройке
3. Рекомендации по лучшим практикам
4. Помощь в выборе подходящих инструментов
5. Решение технических вопросов
6. Консультации по AI-автоматизации

СТИЛЬ ОБЩЕНИЯ:
- Дружелюбный и профессиональный
- Четкие и понятные объяснения
- Практические примеры
- Пошаговые инструкции
- Предложение дополнительных ресурсов

ВАЖНО:
- Всегда предлагайте конкретные следующие шаги
- Включайте ссылки на документацию когда возможно
- Адаптируйте ответы под уровень технических знаний пользователя
- Предлагайте альтернативные решения`,
      {
        maxTokens: 4000,
        temperature: 0.7,
      }
    )
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now()
    
    try {
      // Validate request
      this.validateRequest(request)
      
      // Extract user context
      const userContext = this.extractUserContext(request)
      
      // Enhance context with FlowMasters-specific information
      const enhancedContext = {
        ...userContext,
        platformFeatures: this.getPlatformFeatures(),
        commonTasks: this.getCommonTasks(),
        currentPage: request.context?.currentPage,
      }

      // Generate response using Gemini Pro
      const content = await this.generateResponse(
        request.message,
        enhancedContext,
        {
          model: 'gemini-2.5-flash',
          temperature: 0.7,
        }
      )

      // Generate contextual suggestions
      const suggestions = this.generateContextualSuggestions(request.message)
      
      // Generate helpful actions
      const actions = this.generateHelpfulActions(request.message)

      const response = this.createResponse(content, {
        type: 'text',
        suggestions,
        actions,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0.9,
        },
      })

      // Log interaction
      await this.logInteraction(request, response)

      return response
    } catch (error) {
      logError('FlowMasters Assistant error:', error)
      return this.createErrorResponse(error)
    }
  }

  /**
   * Get platform features for context
   */
  private getPlatformFeatures() {
    return {
      ai_interfaces: ['OpenWebUI', 'Flowise'],
      automation: ['n8n', 'workflow_templates'],
      data_storage: ['Qdrant', 'Weaviate', 'MongoDB'],
      content_management: ['Payload CMS'],
      web_scraping: ['Crawl4AI'],
      integrations: ['CRM', 'ERP', 'APIs', 'webhooks'],
    }
  }

  /**
   * Get common tasks users perform
   */
  private getCommonTasks() {
    return [
      'Создание автоматизированных workflow',
      'Настройка AI чат-ботов',
      'Интеграция с внешними системами',
      'Поиск по документации',
      'Анализ бизнес-данных',
      'Автоматизация email кампаний',
      'Обработка форм и заявок',
    ]
  }

  /**
   * Generate contextual suggestions based on user message
   */
  private generateContextualSuggestions(message: string): string[] {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('автоматизация') || lowerMessage.includes('workflow')) {
      return [
        'Покажите примеры готовых автоматизаций',
        'Как создать workflow в n8n?',
        'Какие интеграции доступны?',
        'Расскажите о шаблонах автоматизации',
      ]
    }
    
    if (lowerMessage.includes('ai') || lowerMessage.includes('ии') || lowerMessage.includes('чат')) {
      return [
        'Как настроить AI чат-бота?',
        'Какие AI модели доступны?',
        'Как работает RAG поиск?',
        'Покажите возможности OpenWebUI',
      ]
    }
    
    if (lowerMessage.includes('интеграция') || lowerMessage.includes('api')) {
      return [
        'Список доступных интеграций',
        'Как подключить CRM систему?',
        'Настройка webhook\'ов',
        'API документация',
      ]
    }
    
    if (lowerMessage.includes('данные') || lowerMessage.includes('поиск')) {
      return [
        'Как работает векторный поиск?',
        'Настройка Qdrant базы данных',
        'Индексация документов',
        'Создание knowledge base',
      ]
    }

    // Default suggestions
    return [
      'Покажите возможности платформы',
      'Как начать работу с FlowMasters?',
      'Примеры использования AI агентов',
      'Документация и руководства',
    ]
  }

  /**
   * Generate helpful actions based on user message
   */
  private generateHelpfulActions(message: string) {
    const actions = []
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('документация') || lowerMessage.includes('руководство')) {
      actions.push({
        type: 'open_documentation',
        label: 'Открыть документацию',
        data: { section: 'getting-started' },
      })
    }

    if (lowerMessage.includes('демо') || lowerMessage.includes('презентация')) {
      actions.push({
        type: 'schedule_demo',
        label: 'Запланировать демо',
        data: { type: 'platform_overview' },
      })
    }

    if (lowerMessage.includes('workflow') || lowerMessage.includes('автоматизация')) {
      actions.push({
        type: 'create_workflow',
        label: 'Создать автоматизацию',
        data: { template: 'basic' },
      })
    }

    if (lowerMessage.includes('поиск') || lowerMessage.includes('найти')) {
      actions.push({
        type: 'navigate',
        label: 'Перейти к поиску',
        data: { page: '/agents/search' },
      })
    }

    return actions
  }

  /**
   * Get agent capabilities
   */
  protected getCapabilities(): string[] {
    return [
      'platform_guidance',
      'feature_explanation',
      'setup_assistance',
      'troubleshooting',
      'best_practices',
      'integration_help',
      'workflow_recommendations',
    ]
  }
}