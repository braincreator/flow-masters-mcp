// Quick Automation Builder Agent
// Generated with AI assistance for rapid development

import { BaseAgent } from '../base-agent'
import { agentClients } from '../clients'
import type { AgentRequest, AgentResponse, WorkflowTemplate } from '../types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Quick Automation Builder Agent
 * Helps users create and manage automated workflows using n8n and Flowise
 */
export class QuickAutomationBuilderAgent extends BaseAgent {
  private workflowTemplates: WorkflowTemplate[] = []

  constructor() {
    super(
      'automation',
      'Quick Automation Builder',
      'Быстрое создание автоматизированных workflow для бизнес-процессов',
      `Вы - эксперт по автоматизации бизнес-процессов с использованием n8n и Flowise. Ваша задача - помочь пользователям создавать эффективные автоматизации.

ВАШИ ВОЗМОЖНОСТИ:
1. Анализ бизнес-процессов для автоматизации
2. Рекомендация подходящих шаблонов workflow
3. Создание кастомных автоматизаций
4. Настройка интеграций с внешними системами
5. Мониторинг и оптимизация существующих workflow
6. Обучение пользователей лучшим практикам

ДОСТУПНЫЕ ИНТЕГРАЦИИ:
- CRM системы (Salesforce, HubSpot, Pipedrive)
- Email сервисы (Gmail, Outlook, SendGrid)
- Мессенджеры (Slack, Telegram, WhatsApp)
- Базы данных (MySQL, PostgreSQL, MongoDB)
- Облачные хранилища (Google Drive, Dropbox)
- Платежные системы (Stripe, PayPal)
- Социальные сети (Facebook, LinkedIn, Twitter)
- Аналитика (Google Analytics, Mixpanel)

ТИПЫ АВТОМАТИЗАЦИЙ:
1. Обработка лидов и клиентов
2. Email маркетинг и уведомления
3. Синхронизация данных между системами
4. Автоматические отчеты и аналитика
5. Обработка форм и заявок
6. Мониторинг и алерты
7. Социальные медиа автоматизация
8. Файловые операции и backup

ПОДХОД К СОЗДАНИЮ:
1. Понимание бизнес-задачи
2. Выбор оптимального решения
3. Настройка и тестирование
4. Документирование процесса
5. Обучение пользователя

ВАЖНО:
- Всегда начинайте с простых решений
- Предлагайте готовые шаблоны когда возможно
- Объясняйте логику автоматизации
- Предупреждайте о потенциальных проблемах`,
      {
        maxTokens: 4000,
        temperature: 0.6,
      }
    )

    // Initialize with basic templates
    this.initializeTemplates()
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now()
    
    try {
      // Validate request
      this.validateRequest(request)
      
      // Analyze user intent
      const intent = this.analyzeAutomationIntent(request.message)
      
      // Load workflow templates if not already loaded
      if (this.workflowTemplates.length === 0) {
        await this.loadWorkflowTemplates()
      }

      let response: AgentResponse

      switch (intent.type) {
        case 'create_workflow':
          response = await this.handleWorkflowCreation(request, intent)
          break
        case 'find_template':
          response = await this.handleTemplateFinding(request, intent)
          break
        case 'explain_automation':
          response = await this.handleAutomationExplanation(request, intent)
          break
        case 'troubleshoot':
          response = await this.handleTroubleshooting(request, intent)
          break
        default:
          response = await this.handleGeneralAutomationQuery(request)
      }

      // Add processing time
      if (response.metadata) {
        response.metadata.processingTime = Date.now() - startTime
      }

      // Log interaction
      await this.logInteraction(request, response)

      return response
    } catch (error) {
      logError('Quick Automation Builder error:', error)
      return this.createErrorResponse(error)
    }
  }

  /**
   * Analyze user intent for automation requests
   */
  private analyzeAutomationIntent(message: string) {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('создать') || lowerMessage.includes('сделать') || lowerMessage.includes('автоматизировать')) {
      return { type: 'create_workflow', confidence: 0.9 }
    }
    
    if (lowerMessage.includes('шаблон') || lowerMessage.includes('пример') || lowerMessage.includes('готовое')) {
      return { type: 'find_template', confidence: 0.8 }
    }
    
    if (lowerMessage.includes('как работает') || lowerMessage.includes('объясни') || lowerMessage.includes('что такое')) {
      return { type: 'explain_automation', confidence: 0.7 }
    }
    
    if (lowerMessage.includes('не работает') || lowerMessage.includes('ошибка') || lowerMessage.includes('проблема')) {
      return { type: 'troubleshoot', confidence: 0.8 }
    }

    return { type: 'general', confidence: 0.5 }
  }

  /**
   * Handle workflow creation requests
   */
  private async handleWorkflowCreation(request: AgentRequest, intent: any): Promise<AgentResponse> {
    // Extract automation requirements
    const requirements = this.extractAutomationRequirements(request.message)
    
    // Find matching templates
    const matchingTemplates = this.findMatchingTemplates(requirements)
    
    // Generate creation guidance
    const context = {
      requirements,
      matchingTemplates,
      userContext: this.extractUserContext(request),
    }

    const content = await this.generateResponse(
      `Помогите создать автоматизацию: ${request.message}`,
      context
    )

    const actions = []
    
    // Add template selection actions
    matchingTemplates.slice(0, 3).forEach(template => {
      actions.push({
        type: 'create_workflow',
        label: `Использовать шаблон: ${template.name}`,
        data: { templateId: template.id, template },
      })
    })

    // Add custom workflow action
    actions.push({
      type: 'create_workflow',
      label: 'Создать с нуля',
      data: { custom: true, requirements },
    })

    return this.createResponse(content, {
      type: 'workflow_template',
      data: {
        requirements,
        templates: matchingTemplates,
        customOptions: this.generateCustomOptions(requirements),
      },
      suggestions: this.generateWorkflowSuggestions(requirements),
      actions,
    })
  }

  /**
   * Handle template finding requests
   */
  private async handleTemplateFinding(request: AgentRequest, intent: any): Promise<AgentResponse> {
    const category = this.extractTemplateCategory(request.message)
    const relevantTemplates = this.workflowTemplates.filter(template => 
      !category || template.category === category
    )

    const content = await this.generateResponse(
      `Покажите шаблоны автоматизации: ${request.message}`,
      { templates: relevantTemplates }
    )

    const actions = relevantTemplates.slice(0, 5).map(template => ({
      type: 'create_workflow',
      label: `Использовать: ${template.name}`,
      data: { templateId: template.id, template },
    }))

    return this.createResponse(content, {
      type: 'workflow_template',
      data: {
        templates: relevantTemplates,
        category,
      },
      actions,
      suggestions: [
        'Показать все шаблоны',
        'Создать кастомную автоматизацию',
        'Объяснить как работают workflow',
      ],
    })
  }

  /**
   * Handle automation explanation requests
   */
  private async handleAutomationExplanation(request: AgentRequest, intent: any): Promise<AgentResponse> {
    const content = await this.generateResponse(request.message, {
      platformCapabilities: this.getPlatformCapabilities(),
      examples: this.getAutomationExamples(),
    })

    return this.createResponse(content, {
      suggestions: [
        'Показать примеры автоматизации',
        'Создать простую автоматизацию',
        'Объяснить интеграции',
        'Лучшие практики автоматизации',
      ],
      actions: [
        {
          type: 'open_documentation',
          label: 'Документация по автоматизации',
          data: { section: 'automation-guide' },
        },
      ],
    })
  }

  /**
   * Handle troubleshooting requests
   */
  private async handleTroubleshooting(request: AgentRequest, intent: any): Promise<AgentResponse> {
    const content = await this.generateResponse(request.message, {
      commonIssues: this.getCommonIssues(),
      debuggingSteps: this.getDebuggingSteps(),
    })

    return this.createResponse(content, {
      suggestions: [
        'Проверить логи выполнения',
        'Тестировать отдельные шаги',
        'Проверить настройки интеграций',
        'Связаться с поддержкой',
      ],
    })
  }

  /**
   * Handle general automation queries
   */
  private async handleGeneralAutomationQuery(request: AgentRequest): Promise<AgentResponse> {
    const content = await this.generateResponse(request.message, {
      capabilities: this.getCapabilities(),
      templates: this.workflowTemplates.slice(0, 3),
    })

    return this.createResponse(content, {
      suggestions: [
        'Показать доступные шаблоны',
        'Создать новую автоматизацию',
        'Объяснить возможности платформы',
        'Примеры использования',
      ],
    })
  }

  /**
   * Extract automation requirements from user message
   */
  private extractAutomationRequirements(message: string) {
    const requirements: any = {
      triggers: [],
      actions: [],
      integrations: [],
      frequency: 'on-demand',
    }

    const lowerMessage = message.toLowerCase()

    // Extract triggers
    if (lowerMessage.includes('новый лид') || lowerMessage.includes('заявка')) {
      requirements.triggers.push('new_lead')
    }
    if (lowerMessage.includes('email') || lowerMessage.includes('письмо')) {
      requirements.triggers.push('email_received')
    }
    if (lowerMessage.includes('форма') || lowerMessage.includes('форму')) {
      requirements.triggers.push('form_submission')
    }

    // Extract actions
    if (lowerMessage.includes('уведомление') || lowerMessage.includes('уведомить')) {
      requirements.actions.push('send_notification')
    }
    if (lowerMessage.includes('сохранить') || lowerMessage.includes('записать')) {
      requirements.actions.push('save_data')
    }
    if (lowerMessage.includes('отправить') || lowerMessage.includes('послать')) {
      requirements.actions.push('send_message')
    }

    // Extract integrations
    const integrations = ['crm', 'email', 'slack', 'telegram', 'database', 'google', 'salesforce']
    integrations.forEach(integration => {
      if (lowerMessage.includes(integration)) {
        requirements.integrations.push(integration)
      }
    })

    return requirements
  }

  /**
   * Find matching workflow templates
   */
  private findMatchingTemplates(requirements: any): WorkflowTemplate[] {
    return this.workflowTemplates.filter(template => {
      // Simple matching logic - can be enhanced with ML
      const templateText = `${template.name} ${template.description} ${template.category}`.toLowerCase()
      
      return requirements.triggers.some((trigger: string) => templateText.includes(trigger)) ||
             requirements.actions.some((action: string) => templateText.includes(action)) ||
             requirements.integrations.some((integration: string) => templateText.includes(integration))
    }).slice(0, 5)
  }

  /**
   * Load workflow templates from n8n
   */
  private async loadWorkflowTemplates(): Promise<void> {
    try {
      this.workflowTemplates = await agentClients.getWorkflowTemplates()
    } catch (error) {
      logError('Failed to load workflow templates:', error)
      // Use fallback templates
      this.initializeTemplates()
    }
  }

  /**
   * Initialize basic workflow templates
   */
  private initializeTemplates(): void {
    this.workflowTemplates = [
      {
        id: 'lead-processing',
        name: 'Обработка новых лидов',
        description: 'Автоматическая обработка и уведомления о новых лидах',
        category: 'sales',
        difficulty: 'beginner',
        estimatedTime: 300,
        triggers: [{ type: 'webhook', name: 'New Lead', description: 'Webhook для новых лидов', config: {} }],
        actions: [
          { type: 'email', name: 'Send Notification', description: 'Отправка уведомления', config: {} },
          { type: 'crm', name: 'Save to CRM', description: 'Сохранение в CRM', config: {} },
        ],
        variables: [
          { name: 'email', type: 'string', description: 'Email для уведомлений', required: true },
          { name: 'crm_endpoint', type: 'string', description: 'Endpoint CRM системы', required: true },
        ],
      },
      // Add more templates...
    ]
  }

  /**
   * Get platform automation capabilities
   */
  private getPlatformCapabilities() {
    return {
      triggers: ['webhooks', 'schedules', 'file_changes', 'email_received'],
      actions: ['send_email', 'api_calls', 'database_operations', 'file_operations'],
      integrations: ['crm', 'email', 'messaging', 'storage', 'analytics'],
    }
  }

  /**
   * Get automation examples
   */
  private getAutomationExamples() {
    return [
      'Автоматическая обработка заявок с сайта',
      'Синхронизация данных между CRM и email маркетингом',
      'Уведомления в Slack о новых продажах',
      'Еженедельные отчеты по аналитике',
    ]
  }

  /**
   * Get common automation issues
   */
  private getCommonIssues() {
    return [
      'Неправильные настройки API ключей',
      'Ошибки в формате данных',
      'Превышение лимитов API',
      'Проблемы с аутентификацией',
    ]
  }

  /**
   * Get debugging steps
   */
  private getDebuggingSteps() {
    return [
      'Проверить логи выполнения workflow',
      'Тестировать каждый шаг отдельно',
      'Проверить настройки подключений',
      'Убедиться в корректности данных',
    ]
  }

  /**
   * Extract template category from message
   */
  private extractTemplateCategory(message: string): string | null {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('продажи') || lowerMessage.includes('лид')) return 'sales'
    if (lowerMessage.includes('маркетинг') || lowerMessage.includes('email')) return 'marketing'
    if (lowerMessage.includes('поддержка') || lowerMessage.includes('клиент')) return 'support'
    if (lowerMessage.includes('данные') || lowerMessage.includes('синхронизация')) return 'data'
    if (lowerMessage.includes('отчет') || lowerMessage.includes('аналитика')) return 'analytics'
    
    return null
  }

  /**
   * Generate workflow suggestions
   */
  private generateWorkflowSuggestions(requirements: any): string[] {
    const suggestions = []
    
    if (requirements.triggers.includes('new_lead')) {
      suggestions.push('Добавить уведомления в Slack')
      suggestions.push('Настроить автоответ клиенту')
    }
    
    if (requirements.integrations.includes('email')) {
      suggestions.push('Создать email последовательность')
      suggestions.push('Настроить сегментацию клиентов')
    }
    
    suggestions.push('Добавить аналитику и отчеты')
    suggestions.push('Настроить резервное копирование данных')
    
    return suggestions.slice(0, 4)
  }

  /**
   * Generate custom workflow options
   */
  private generateCustomOptions(requirements: any) {
    return {
      complexity: requirements.integrations.length > 2 ? 'advanced' : 'basic',
      estimatedTime: Math.max(30, requirements.triggers.length * 15 + requirements.actions.length * 10),
      recommendedApproach: requirements.integrations.length > 0 ? 'template-based' : 'custom',
    }
  }

  /**
   * Get agent capabilities
   */
  protected getCapabilities(): string[] {
    return [
      'workflow_creation',
      'template_management',
      'integration_setup',
      'automation_optimization',
      'troubleshooting',
      'best_practices',
    ]
  }
}