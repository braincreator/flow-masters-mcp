/**
 * Информация о версии API
 */
export interface VersionInfo {
  version: string
  apiVersion: string
  lastUpdate: string
  requiredVersion?: string
  deprecated?: boolean
  message?: string
}

/**
 * Настройки подключения к API
 */
export interface ApiConfig {
  apiUrl: string
  apiKey: string
  autoUpdate: boolean
  updateCheckInterval: number
}

/**
 * Ответ API с данными
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errorCode?: number
  meta?: {
    pagination?: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  }
}

/**
 * Интерфейс для интеграционных данных с Flow Masters
 */
export interface FlowMastersIntegration {
  id: string
  name: string
  type: 'webhook' | 'email' | 'crm' | 'custom'
  status: 'active' | 'inactive'
  webhookUrl?: string
  apiKey?: string
  triggers: IntegrationTrigger[]
  actions: IntegrationAction[]
  lastSync?: string
  lastSyncStatus?: 'success' | 'error'
  lastError?: string
}

export interface IntegrationTrigger {
  event: string
  conditions?: IntegrationCondition[]
}

export interface IntegrationCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains'
  value: string
}

export interface IntegrationAction {
  type: 'http' | 'email'
  config?: {
    url?: string
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    headers?: Record<string, any>
    body?: any
    to?: string
    from?: string
    subject?: string
    emailBody?: string
  }
}

/**
 * Параметры для MCP сервера
 */
export interface MCPServerConfig {
  port?: number
  host?: string
  apiConfig: ApiConfig
}
