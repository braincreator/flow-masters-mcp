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
  /**
   * Базовый путь для всех API запросов
   */
  basePath: string
  /**
   * Версия API для запросов
   */
  apiVersion: string
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
  /**
   * Настройки для работы с LLM
   */
  llm: LLMConfig
}

/**
 * Настройки для работы с LLM
 */
export interface LLMConfig {
  /**
   * Включен ли режим работы с контекстом модели
   */
  modelContextEnabled: boolean
  /**
   * Разрешенные модели (массив ID моделей или * для всех)
   */
  allowedModels: string[] | '*'
  /**
   * Максимальное количество токенов в ответе
   */
  maxTokens: number
  /**
   * Размер контекстного окна для запросов
   */
  contextWindow: number
  /**
   * Кеширование контекста
   */
  caching?: {
    enabled: boolean
    ttl: number
  }
}

/**
 * Структура API эндпоинта для индексирования
 */
export interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string
  description?: string
  parameters?: ApiParameter[]
  response?: any
  security?: boolean
  tags?: string[]
  deprecated?: boolean
}

/**
 * Параметр API эндпоинта
 */
export interface ApiParameter {
  name: string
  in: 'query' | 'path' | 'body' | 'header'
  required: boolean
  type: string
  description?: string
}

/**
 * Структура базы знаний эндпоинтов для LLM
 */
export interface EndpointKnowledgeBase {
  endpoints: ApiEndpoint[]
  lastUpdated: string
  version: string
}

/**
 * Запрос на получение контекста модели
 */
export interface ModelContextRequest {
  query: string
  model?: string
  options?: {
    maxTokens?: number
    temperature?: number
    search?: {
      query?: string
      filters?: Record<string, any>
    }
  }
}

/**
 * Ответ с контекстом модели
 */
export interface ModelContextResponse {
  success: boolean
  context: string
  endpoints?: ApiEndpoint[]
  error?: string
  model?: string
  timestamp: string
}
