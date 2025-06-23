// FlowMasters Multimodal Agent - Powered by Gemini Pro Vision
// Generated with AI assistance for rapid development

import { BaseAgent } from '../base-agent'
import { vertexAIClient } from '../vertex-ai-client'
import type { AgentRequest, AgentResponse } from '../types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Multimodal Agent using Gemini Pro Vision
 * Supports text, image, and document analysis
 */
export class MultimodalAgent extends BaseAgent {
  constructor() {
    super(
      'multimodal',
      'Multimodal AI Assistant',
      'Анализ изображений, документов и мультимедиа контента с помощью Gemini Pro Vision',
      `Вы - эксперт по анализу мультимедиа контента с использованием Gemini Pro Vision. Ваша задача - анализировать изображения, документы, схемы и другой визуальный контент.

ВАШИ ВОЗМОЖНОСТИ:
1. Анализ изображений и фотографий
2. Распознавание текста на изображениях (OCR)
3. Анализ диаграмм, схем и графиков
4. Описание интерфейсов и UI/UX элементов
5. Анализ документов и презентаций
6. Извлечение данных из таблиц и форм
7. Анализ архитектурных схем и workflow
8. Описание продуктов и объектов

ТИПЫ КОНТЕНТА:
- Скриншоты интерфейсов
- Диаграммы и схемы
- Документы и презентации
- Фотографии продуктов
- Графики и чарты
- Архитектурные схемы
- Workflow диаграммы
- Формы и таблицы

ФОРМАТ ОТВЕТОВ:
1. Краткое описание изображения
2. Детальный анализ содержимого
3. Извлеченный текст (если есть)
4. Структурированные данные
5. Рекомендации и инсайты
6. Связанные действия

ВАЖНО:
- Всегда описывайте что видите на изображении
- Извлекайте весь видимый текст
- Анализируйте структуру и компоненты
- Предлагайте практические применения
- Учитывайте контекст FlowMasters платформы`,
      {
        maxTokens: 4000,
        temperature: 0.3, // Lower temperature for more accurate analysis
      }
    )
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now()
    
    try {
      // Validate request
      this.validateRequest(request)
      
      // Check if request contains image
      const imageUrl = this.extractImageUrl(request)
      
      if (imageUrl) {
        return await this.processImageRequest(request, imageUrl)
      } else {
        return await this.processTextRequest(request)
      }
    } catch (error) {
      logError('Multimodal Agent error:', error)
      return this.createErrorResponse(error)
    }
  }

  /**
   * Process request with image using Gemini Pro Vision
   */
  private async processImageRequest(
    request: AgentRequest,
    imageUrl: string
  ): Promise<AgentResponse> {
    const startTime = Date.now()
    
    try {
      // Analyze image with Gemini Pro Vision
      const imageAnalysis = await vertexAIClient.analyzeImage(
        imageUrl,
        `Проанализируйте это изображение в контексте запроса: "${request.message}"
        
        Предоставьте:
        1. Общее описание изображения
        2. Детальный анализ содержимого
        3. Извлеченный текст (если есть)
        4. Структурированные данные
        5. Практические рекомендации
        6. Связь с FlowMasters платформой (если применимо)`,
        {
          temperature: 0.3,
          maxTokens: 3000,
        }
      )

      // Extract structured data if possible
      const structuredData = await this.extractStructuredData(imageAnalysis, imageUrl)
      
      // Generate actionable suggestions
      const suggestions = this.generateImageSuggestions(request.message, imageAnalysis)
      
      // Create actions based on analysis
      const actions = this.generateImageActions(imageAnalysis, imageUrl)

      const response = this.createResponse(imageAnalysis, {
        type: 'multimodal_analysis',
        data: {
          imageUrl,
          analysis: imageAnalysis,
          structuredData,
          extractedText: this.extractTextFromAnalysis(imageAnalysis),
        },
        suggestions,
        actions,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0.9,
          model: 'gemini-2.5-flash-vision',
        },
      })

      // Log interaction
      await this.logInteraction(request, response)

      return response
    } catch (error) {
      logError('Image processing error:', error)
      return this.createErrorResponse(error)
    }
  }

  /**
   * Process text-only request
   */
  private async processTextRequest(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now()
    
    try {
      // Generate response for text-only queries about multimodal capabilities
      const content = await this.generateResponse(
        request.message,
        {
          capabilities: this.getMultimodalCapabilities(),
          examples: this.getUsageExamples(),
        },
        {
          model: 'gemini-2.5-flash',
          temperature: 0.7,
        }
      )

      const suggestions = [
        'Загрузите изображение для анализа',
        'Покажите скриншот интерфейса',
        'Поделитесь диаграммой или схемой',
        'Загрузите документ для анализа',
      ]

      const response = this.createResponse(content, {
        type: 'text',
        suggestions,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0.8,
        },
      })

      await this.logInteraction(request, response)
      return response
    } catch (error) {
      logError('Text processing error:', error)
      return this.createErrorResponse(error)
    }
  }

  /**
   * Extract image URL from request
   */
  private extractImageUrl(request: AgentRequest): string | null {
    // Check if image URL is provided in context
    if (request.context?.imageUrl) {
      return request.context.imageUrl
    }

    // Check if image URL is in message
    const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp))/i
    const match = request.message.match(urlRegex)
    return match ? match[0] : null
  }

  /**
   * Extract structured data from image analysis
   */
  private async extractStructuredData(analysis: string, imageUrl: string): Promise<any> {
    try {
      // Use Gemini to extract structured data
      const structuredData = await vertexAIClient.generateStructuredResponse(
        `Извлеките структурированные данные из этого анализа изображения: ${analysis}`,
        {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Тип изображения' },
            elements: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Основные элементы на изображении'
            },
            text: { type: 'string', description: 'Извлеченный текст' },
            colors: {
              type: 'array',
              items: { type: 'string' },
              description: 'Основные цвета'
            },
            objects: {
              type: 'array',
              items: { type: 'string' },
              description: 'Обнаруженные объекты'
            },
            actionable_items: {
              type: 'array',
              items: { type: 'string' },
              description: 'Элементы, требующие действий'
            }
          }
        }
      )

      return structuredData
    } catch (error) {
      logError('Error extracting structured data:', error)
      return null
    }
  }

  /**
   * Extract text from analysis
   */
  private extractTextFromAnalysis(analysis: string): string {
    // Simple text extraction - can be enhanced
    const textMatch = analysis.match(/текст[:\s]*(.*?)(?:\n|$)/i)
    return textMatch ? textMatch[1].trim() : ''
  }

  /**
   * Generate suggestions based on image analysis
   */
  private generateImageSuggestions(query: string, analysis: string): string[] {
    const suggestions = []
    
    if (analysis.includes('интерфейс') || analysis.includes('UI')) {
      suggestions.push('Создать автоматизацию для этого интерфейса')
      suggestions.push('Анализировать UX паттерны')
    }
    
    if (analysis.includes('диаграмма') || analysis.includes('схема')) {
      suggestions.push('Создать workflow по этой схеме')
      suggestions.push('Оптимизировать процесс')
    }
    
    if (analysis.includes('таблица') || analysis.includes('данные')) {
      suggestions.push('Извлечь данные в структурированном виде')
      suggestions.push('Создать автоматизацию обработки данных')
    }
    
    if (analysis.includes('форма')) {
      suggestions.push('Автоматизировать заполнение формы')
      suggestions.push('Создать валидацию полей')
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        'Анализировать похожие изображения',
        'Создать автоматизацию на основе анализа',
        'Извлечь больше деталей',
        'Сравнить с другими изображениями'
      )
    }

    return suggestions.slice(0, 4)
  }

  /**
   * Generate actions based on image analysis
   */
  private generateImageActions(analysis: string, imageUrl: string) {
    const actions = []

    // Always add download action
    actions.push({
      type: 'download_analysis',
      label: 'Скачать анализ',
      data: { analysis, imageUrl },
    })

    if (analysis.includes('workflow') || analysis.includes('процесс')) {
      actions.push({
        type: 'create_workflow',
        label: 'Создать автоматизацию',
        data: { based_on: 'image_analysis', imageUrl },
      })
    }

    if (analysis.includes('текст') || analysis.includes('OCR')) {
      actions.push({
        type: 'extract_text',
        label: 'Извлечь весь текст',
        data: { imageUrl },
      })
    }

    actions.push({
      type: 'analyze_similar',
      label: 'Найти похожие изображения',
      data: { imageUrl },
    })

    return actions
  }

  /**
   * Get multimodal capabilities
   */
  private getMultimodalCapabilities() {
    return [
      'Анализ изображений и фотографий',
      'Распознавание текста (OCR)',
      'Анализ диаграмм и схем',
      'Описание интерфейсов',
      'Извлечение данных из таблиц',
      'Анализ workflow диаграмм',
    ]
  }

  /**
   * Get usage examples
   */
  private getUsageExamples() {
    return [
      'Анализ скриншота интерфейса для создания автоматизации',
      'Извлечение данных из таблицы на изображении',
      'Описание workflow диаграммы для n8n',
      'Анализ архитектурной схемы системы',
    ]
  }

  /**
   * Get agent capabilities
   */
  protected getCapabilities(): string[] {
    return [
      'image_analysis',
      'ocr_text_extraction',
      'diagram_analysis',
      'ui_analysis',
      'document_analysis',
      'structured_data_extraction',
      'multimodal_understanding',
    ]
  }
}