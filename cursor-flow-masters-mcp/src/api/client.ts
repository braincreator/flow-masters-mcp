import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import {
  ApiConfig,
  ApiResponse,
  VersionInfo,
  FlowMastersIntegration,
  ApiEndpoint,
  EndpointKnowledgeBase,
} from '../types'

/**
 * Клиент API для взаимодействия с Flow Masters
 */
export class ApiClient {
  private client: AxiosInstance
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config

    // Подготавливаем базовый URL с версией API
    const baseURL = this.buildApiUrl(config.apiUrl, config.basePath, config.apiVersion)

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${config.apiKey}`,
        'X-Client': 'Cursor-MCP-Server',
      },
      timeout: 10000,
    })

    // Добавляем интерцептор для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      },
    )
  }

  /**
   * Построение URL API с версионированием
   */
  private buildApiUrl(apiUrl: string, basePath: string, apiVersion: string): string {
    // Удаляем завершающие слеши
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const base = basePath.startsWith('/') ? basePath : `/${basePath}`
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base

    // Строим URL с версией API
    return `${baseUrl}${cleanBase}/${apiVersion}`
  }

  /**
   * Получить информацию о версии API
   */
  async getVersion(): Promise<ApiResponse<VersionInfo>> {
    try {
      const response = await this.client.get('/version')
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Проверить подключение к API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      return response.data.success === true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  /**
   * Получить интеграции по типу
   */
  async getIntegrations(type?: string): Promise<ApiResponse<FlowMastersIntegration[]>> {
    try {
      const params = type ? { type } : undefined
      const response = await this.client.get('/integrations', { params })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Отправить данные на вебхук
   */
  async sendWebhookData(webhookUrl: string, data: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post(webhookUrl, data)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Получить обновления для MCP сервера
   */
  async checkForUpdates(currentVersion: string): Promise<
    ApiResponse<{
      hasUpdate: boolean
      latestVersion: string
      downloadUrl?: string
      releaseNotes?: string
    }>
  > {
    try {
      const response = await this.client.get('/mcp/updates', {
        params: { version: currentVersion },
      })
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Получить список доступных эндпоинтов API
   */
  async getApiEndpoints(): Promise<ApiResponse<ApiEndpoint[]>> {
    try {
      const response = await this.client.get('/endpoints')
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Получить базу знаний эндпоинтов для LLM
   */
  async getEndpointKnowledgeBase(): Promise<ApiResponse<EndpointKnowledgeBase>> {
    try {
      const response = await this.client.get('/endpoints/knowledge-base')
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Выполнить общий запрос к API
   */
  async request<T = any>(
    method: string,
    path: string,
    data?: any,
    params?: any,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        method,
        url: path,
        headers,
      }

      if (data) {
        config.data = data
      }

      if (params) {
        config.params = params
      }

      const response = await this.client.request<ApiResponse<T>>(config)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
