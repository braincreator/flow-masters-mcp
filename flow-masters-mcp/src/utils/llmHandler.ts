import { LLMConfig, ModelContextRequest, ModelContextResponse, ApiEndpoint } from '../types'
import { EndpointsCrawler } from './endpointsCrawler'
import NodeCache from 'node-cache'

export class LLMHandler {
  private config: LLMConfig
  private endpointsCrawler: EndpointsCrawler
  private cache: NodeCache | null = null

  constructor(config: LLMConfig, endpointsCrawler: EndpointsCrawler) {
    this.config = config
    this.endpointsCrawler = endpointsCrawler

    // Инициализация кеша, если включен
    if (this.config.caching?.enabled) {
      this.cache = new NodeCache({
        stdTTL: this.config.caching.ttl || 3600, // 1 час по умолчанию
        checkperiod: 120,
        useClones: false,
      })
    }
  }

  /**
   * Обработка запроса на получение контекста модели
   */
  async handleModelContextRequest(request: ModelContextRequest): Promise<ModelContextResponse> {
    try {
      // Проверка, включен ли режим работы с контекстом
      if (!this.config.modelContextEnabled) {
        return {
          success: false,
          context: '',
          error: 'Model context mode is disabled',
          timestamp: new Date().toISOString(),
        }
      }

      // Проверка разрешения на использование модели
      const model = request.model || 'default'
      if (this.config.allowedModels !== '*' && !this.config.allowedModels.includes(model)) {
        return {
          success: false,
          context: '',
          error: `Model ${model} is not allowed`,
          timestamp: new Date().toISOString(),
        }
      }

      // Проверка кеша
      const cacheKey = `${model}:${request.query}`
      if (this.cache && this.cache.has(cacheKey)) {
        const cachedResponse = this.cache.get<ModelContextResponse>(cacheKey)
        if (cachedResponse) {
          console.log(`Использован кешированный контекст для запроса: ${request.query}`)
          return cachedResponse
        }
      }

      // Поиск по базе знаний
      let relevantEndpoints: ApiEndpoint[] = []

      if (request.options?.search?.query) {
        // Если передан поисковый запрос, используем его
        relevantEndpoints = this.endpointsCrawler.searchEndpoints(request.options.search.query)
      } else {
        // Иначе используем основной запрос
        relevantEndpoints = this.endpointsCrawler.searchEndpoints(request.query)
      }

      // Генерация контекста
      const context = this.generateContext(request.query, relevantEndpoints)

      // Формирование ответа
      const response: ModelContextResponse = {
        success: true,
        context,
        endpoints: relevantEndpoints,
        model,
        timestamp: new Date().toISOString(),
      }

      // Кеширование
      if (this.cache) {
        this.cache.set(cacheKey, response)
      }

      return response
    } catch (error) {
      console.error('Ошибка при обработке запроса контекста модели:', error)

      return {
        success: false,
        context: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Генерация контекста на основе найденных эндпоинтов
   */
  private generateContext(query: string, endpoints: ApiEndpoint[]): string {
    const maxEndpoints = 10 // Максимальное количество эндпоинтов для включения в контекст
    const limitedEndpoints = endpoints.slice(0, maxEndpoints)

    // Проверяем, содержит ли запрос упоминание о блоках или лендингах
    const isBlocksRelated =
      query.toLowerCase().includes('блок') ||
      query.toLowerCase().includes('block') ||
      query.toLowerCase().includes('лендинг') ||
      query.toLowerCase().includes('landing') ||
      query.toLowerCase().includes('страниц') ||
      query.toLowerCase().includes('page')

    // Базовая информация
    let context = `Запрос: "${query}"

Ниже представлена информация о доступных API эндпоинтах, которые могут быть полезны для выполнения этого запроса:

`

    // Добавляем информацию о блоках API, если запрос связан с блоками или лендингами
    if (isBlocksRelated) {
      context += `ВАЖНО: Для получения информации о доступных блоках для встраивания в шаблоны страниц используйте эндпоинт:

GET /api/blocks

Этот эндпоинт возвращает список всех доступных блоков с их описаниями, полями и примерами использования.

`
    }

    // Формируем описание каждого эндпоинта
    if (limitedEndpoints.length > 0) {
      limitedEndpoints.forEach((endpoint, index) => {
        context += `${index + 1}. ${endpoint.method} ${endpoint.path}
   Описание: ${endpoint.description || 'Нет описания'}
   ${
     endpoint.parameters && endpoint.parameters.length > 0
       ? `Параметры: ${endpoint.parameters.map((p) => `${p.name} (${p.in}${p.required ? ', обязательный' : ''})`).join(', ')}`
       : 'Параметры: Нет параметров'
   }
   Требуется авторизация: ${endpoint.security ? 'Да' : 'Нет'}
   ${endpoint.tags && endpoint.tags.length > 0 ? `Теги: ${endpoint.tags.join(', ')}` : ''}
`
      })
    } else {
      context += 'Не найдено подходящих API эндпоинтов для этого запроса.\n'
    }

    // Общее количество доступных эндпоинтов
    const totalEndpoints = this.endpointsCrawler.getEndpointCount()
    context += `\nВсего доступно ${totalEndpoints} API эндпоинтов в системе.`

    // Инструкции по использованию
    context += `\n\nДля работы с API рекомендуется использовать приведенные выше эндпоинты. Все запросы должны содержать заголовок Authorization и отправляться на базовый URL API с правильным путем.`

    return context
  }

  /**
   * Очистить кеш
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.flushAll()
      console.log('Кеш контекста модели очищен')
    }
  }
}
