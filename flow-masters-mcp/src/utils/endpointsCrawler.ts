import axios from 'axios'
import { ApiClient } from '../api/client'
import { ApiEndpoint, EndpointKnowledgeBase } from '../types'
import fs from 'fs'
import path from 'path'

export class EndpointsCrawler {
  private client: ApiClient
  private knowledgeBase: EndpointKnowledgeBase
  private knowledgeBasePath: string

  constructor(apiClient: ApiClient, knowledgeBasePath?: string) {
    this.client = apiClient
    this.knowledgeBasePath = knowledgeBasePath || path.join(process.cwd(), 'data', 'endpoints.json')

    // Инициализация базы знаний
    this.knowledgeBase = {
      endpoints: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    }

    // Создаем директорию для базы знаний, если не существует
    const dir = path.dirname(this.knowledgeBasePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  /**
   * Загрузить базу знаний из файла, если существует
   */
  async loadKnowledgeBase(): Promise<void> {
    try {
      if (fs.existsSync(this.knowledgeBasePath)) {
        const data = fs.readFileSync(this.knowledgeBasePath, 'utf8')
        this.knowledgeBase = JSON.parse(data)
        console.log(
          `Загружена существующая база знаний с ${this.knowledgeBase.endpoints.length} эндпоинтами`,
        )
      } else {
        console.log('База знаний не найдена, будет создана новая')
      }
    } catch (error) {
      console.error('Ошибка при загрузке базы знаний:', error)
      // Сохраняем новую базу знаний
      this.saveKnowledgeBase()
    }
  }

  /**
   * Сохранить базу знаний в файл
   */
  saveKnowledgeBase(): void {
    try {
      fs.writeFileSync(this.knowledgeBasePath, JSON.stringify(this.knowledgeBase, null, 2), 'utf8')
      console.log(`База знаний сохранена с ${this.knowledgeBase.endpoints.length} эндпоинтами`)
    } catch (error) {
      console.error('Ошибка при сохранении базы знаний:', error)
    }
  }

  /**
   * Обновить базу знаний эндпоинтов с сервера API
   */
  async updateEndpoints(): Promise<boolean> {
    try {
      console.log('Обновление базы знаний эндпоинтов...')

      // Сначала попробуем получить знания с API напрямую
      const apiKnowledgeBase = await this.client.getEndpointKnowledgeBase()

      if (apiKnowledgeBase.success && apiKnowledgeBase.data) {
        console.log('Получена база знаний напрямую от API')
        this.knowledgeBase = apiKnowledgeBase.data
        this.saveKnowledgeBase()
        return true
      }

      // Если не получилось, получаем список эндпоинтов и обновляем базу
      const endpointsResponse = await this.client.getApiEndpoints()

      if (endpointsResponse.success && endpointsResponse.data) {
        console.log(`Получено ${endpointsResponse.data.length} эндпоинтов от API`)
        this.knowledgeBase.endpoints = endpointsResponse.data
        this.knowledgeBase.lastUpdated = new Date().toISOString()
        this.saveKnowledgeBase()
        return true
      }

      // Если оба метода не сработали, пробуем сканировать Next.js API маршруты
      const success = await this.scanNextJsApi()
      if (success) {
        return true
      }

      console.warn('Не удалось обновить базу знаний эндпоинтов')
      return false
    } catch (error) {
      console.error('Ошибка при обновлении эндпоинтов:', error)
      return false
    }
  }

  /**
   * Сканирование Next.js API роутов
   */
  private async scanNextJsApi(): Promise<boolean> {
    try {
      console.log('Сканирование Next.js API роутов...')

      // Получить список доступных роутов от API
      const response = await axios.get(`${this.client['config'].apiUrl}/api/site-map`)

      if (response.data && response.data.routes) {
        // Фильтруем только API маршруты
        const apiRoutes = response.data.routes.filter(
          (route: string) => route.startsWith('/api/') && !route.includes('admin'),
        )

        console.log(`Найдено ${apiRoutes.length} API маршрутов`)

        // Преобразуем в формат ApiEndpoint
        const endpoints: ApiEndpoint[] = apiRoutes.map((route: string) => {
          const method = route.includes('webhook') ? 'POST' : 'GET'
          return {
            path: route.replace('/api', ''), // Удаляем /api из пути
            method,
            description: `API endpoint for ${route}`,
            parameters: [],
            security: false,
            tags: ['api'],
          }
        })

        this.knowledgeBase.endpoints = endpoints
        this.knowledgeBase.lastUpdated = new Date().toISOString()
        this.saveKnowledgeBase()
        return true
      }

      return false
    } catch (error) {
      console.error('Ошибка при сканировании Next.js API:', error)
      return false
    }
  }

  /**
   * Поиск эндпоинтов по запросу
   */
  searchEndpoints(query: string): ApiEndpoint[] {
    if (!query || query.trim() === '') {
      return this.knowledgeBase.endpoints.slice(0, 10) // Возвращаем 10 первых эндпоинтов
    }

    const searchTerms = query.toLowerCase().split(' ')

    return this.knowledgeBase.endpoints.filter((endpoint) => {
      const endpointText =
        `${endpoint.path} ${endpoint.method} ${endpoint.description || ''} ${endpoint.tags?.join(' ') || ''}`.toLowerCase()

      return searchTerms.every((term) => endpointText.includes(term))
    })
  }

  /**
   * Получить все эндпоинты
   */
  getAllEndpoints(): ApiEndpoint[] {
    return this.knowledgeBase.endpoints
  }

  /**
   * Получить количество эндпоинтов
   */
  getEndpointCount(): number {
    return this.knowledgeBase.endpoints.length
  }
}
