import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ApiConfig, ApiResponse, VersionInfo, FlowMastersIntegration } from '../types'

/**
 * Клиент API для взаимодействия с Flow Masters
 */
export class ApiClient {
  private client: AxiosInstance
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config

    this.client = axios.create({
      baseURL: config.apiUrl,
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
   * Получить информацию о версии API
   */
  async getVersion(): Promise<ApiResponse<VersionInfo>> {
    try {
      const response = await this.client.get('/api/version')
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
      const response = await this.client.get('/api/health')
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
      const response = await this.client.get('/api/integrations', { params })
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
      const response = await this.client.get('/api/mcp/updates', {
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
}
