import { cookies } from 'next/headers'
import OpenAI from 'openai'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Типы для провайдеров и моделей
export type AIProvider =
  | 'openai'
  | 'google'
  | 'deepseek'
  | 'anthropic'
  | 'openrouter'
  | 'requesty'
  | 'mistral'
  | 'openai-compatible'
export type AIModel = {
  id: string
  name: string
  description?: string
  capabilities?: string[]
  maxTokens?: number
  provider: AIProvider
}

// Интерфейс для провайдера OpenAI Compatible
export interface OpenAICompatibleConfig {
  baseUrl: string
  apiKey: string
}

// Интерфейсы для ответов API провайдеров
interface OpenRouterModel {
  id: string
  name?: string
  description?: string
  context_length?: number
  pricing?: {
    prompt?: number
    completion?: number
  }
}

interface GoogleModel {
  name: string
  displayName?: string
  description?: string
  supportedGenerationMethods?: string[]
  inputTokenLimit?: number
  outputTokenLimit?: number
}

// Интерфейс для сервиса провайдеров
export interface AIProviderService {
  getModels(
    provider: AIProvider,
    apiKey?: string,
    options?: { baseUrl?: string },
  ): Promise<AIModel[]>
  validateApiKey(
    provider: AIProvider,
    apiKey: string,
    options?: { baseUrl?: string },
  ): Promise<boolean>
  saveApiKey(provider: AIProvider, apiKey: string, options?: { baseUrl?: string }): Promise<void>
  getApiKey(provider: AIProvider): Promise<string | undefined>
  getBaseUrl(provider: AIProvider): Promise<string | undefined>
  saveBaseUrl(provider: AIProvider, baseUrl: string): Promise<void>
  deleteApiKey(provider: AIProvider): Promise<void>
  deleteBaseUrl(provider: AIProvider): Promise<void>
}

// Константы для имен куки
const API_KEY_COOKIE_PREFIX = 'ai_provider_api_key_'
const BASE_URL_COOKIE_PREFIX = 'ai_provider_base_url_'
const COOKIE_EXPIRY_DAYS = 30 // Срок хранения куки в днях

// Стандартные URL для провайдеров
const DEFAULT_BASE_URLS = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  requesty: 'https://api.requesty.ai/api/v1',
  mistral: 'https://api.mistral.ai/v1',
}

/**
 * Сервис для работы с провайдерами AI
 */
export class ProviderService implements AIProviderService {
  /**
   * Получает список доступных моделей для указанного провайдера
   */
  async getModels(
    provider: AIProvider,
    apiKey?: string,
    options?: { baseUrl?: string },
  ): Promise<AIModel[]> {
    try {
      // Получаем baseUrl из опций или из сохраненных настроек
      const baseUrl =
        options?.baseUrl ||
        (await this.getBaseUrl(provider)) ||
        DEFAULT_BASE_URLS[provider as keyof typeof DEFAULT_BASE_URLS]

      // Определяем, какие провайдеры могут предоставить список моделей без API ключа
      switch (provider) {
        case 'openai':
          // OpenAI всегда требует API ключ
          return await this.getOpenAIModels(apiKey)
        case 'google':
          // Google требует API ключ, но мы можем вернуть дефолтные модели
          return this.getGoogleModels(apiKey)
        case 'deepseek':
          // DeepSeek требует API ключ
          return this.getDeepSeekModels(apiKey, baseUrl)
        case 'anthropic':
          // Anthropic имеет фиксированный список моделей
          return this.getAnthropicModels()
        case 'openrouter':
          // OpenRouter предоставляет публичный API для списка моделей
          return await this.getOpenRouterModels()
        case 'requesty':
          // Requesty имеет фиксированный список моделей
          return this.getRequestyModels()
        case 'mistral':
          // Mistral требует API ключ
          return this.getMistralModels(apiKey, baseUrl)
        case 'openai-compatible':
          // OpenAI Compatible требует API ключ и baseUrl
          return await this.getOpenAICompatibleModels(apiKey, baseUrl)
        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }
    } catch (error) {
      logError(`Error fetching models for provider ${provider}:`, error)
      // Возвращаем дефолтные модели в случае ошибки
      return this.getDefaultModels(provider)
    }
  }

  /**
   * Проверяет валидность API ключа для указанного провайдера
   */
  async validateApiKey(
    provider: AIProvider,
    apiKey: string,
    options?: { baseUrl?: string },
  ): Promise<boolean> {
    try {
      // Получаем baseUrl из опций или из сохраненных настроек
      const baseUrl =
        options?.baseUrl ||
        (await this.getBaseUrl(provider)) ||
        DEFAULT_BASE_URLS[provider as keyof typeof DEFAULT_BASE_URLS]

      switch (provider) {
        case 'openai':
          const openai = new OpenAI({ apiKey })
          const models = await openai.models.list()
          return models.data.length > 0
        case 'google':
          try {
            // Проверяем ключ через запрос к API для получения списка моделей
            const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
            const response = await fetch(url)

            if (!response.ok) {
              throw new Error(`Failed to validate Google API key: ${response.statusText}`)
            }

            const data = await response.json()
            return data && data.models && data.models.length > 0
          } catch (error) {
            logError('Error validating Google API key:', error)
            return false
          }
        case 'deepseek':
          // Для DeepSeek используем OpenAI клиент с другим базовым URL
          const deepseek = new OpenAI({
            apiKey,
            baseURL: baseUrl || 'https://api.deepseek.com/v1',
          })
          await deepseek.models.list()
          return true
        case 'anthropic':
          // Для Anthropic нужна отдельная реализация
          // Здесь можно добавить проверку ключа Anthropic
          return true
        case 'openrouter':
          // Для OpenRouter используем OpenAI клиент с другим базовым URL
          const openrouter = new OpenAI({
            apiKey,
            baseURL: baseUrl || 'https://openrouter.ai/api/v1',
          })
          await openrouter.models.list()
          return true
        case 'requesty':
          // Для Requesty используем OpenAI клиент с другим базовым URL
          const requesty = new OpenAI({
            apiKey,
            baseURL: baseUrl || 'https://api.requesty.ai/api/v1',
          })
          await requesty.models.list()
          return true
        case 'mistral':
          // Для Mistral используем OpenAI клиент с другим базовым URL
          const mistral = new OpenAI({
            apiKey,
            baseURL: baseUrl || 'https://api.mistral.ai/v1',
          })
          await mistral.models.list()
          return true
        case 'openai-compatible':
          // Для OpenAI Compatible необходим baseUrl
          if (!baseUrl) {
            throw new Error('Base URL is required for OpenAI Compatible provider')
          }
          const openaiCompatible = new OpenAI({
            apiKey,
            baseURL: baseUrl,
          })
          await openaiCompatible.models.list()
          return true
        default:
          return false
      }
    } catch (error) {
      logError(`Error validating API key for provider ${provider}:`, error)
      return false
    }
  }

  /**
   * Сохраняет API ключ для указанного провайдера
   */
  async saveApiKey(
    provider: AIProvider,
    apiKey: string,
    options?: { baseUrl?: string },
  ): Promise<void> {
    const cookieStore = await cookies()
    const cookieName = `${API_KEY_COOKIE_PREFIX}${provider}`

    // Устанавливаем куки с API ключом
    cookieStore.set({
      name: cookieName,
      value: apiKey,
      expires: new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    // Если есть baseUrl в опциях, сохраняем его тоже
    if (options?.baseUrl) {
      await this.saveBaseUrl(provider, options.baseUrl)
    }
  }

  /**
   * Получает сохраненный API ключ для указанного провайдера
   */
  async getApiKey(provider: AIProvider): Promise<string | undefined> {
    const cookieStore = await cookies()
    const cookieName = `${API_KEY_COOKIE_PREFIX}${provider}`
    const apiKeyCookie = cookieStore.get(cookieName)

    return apiKeyCookie?.value
  }

  /**
   * Сохраняет базовый URL для указанного провайдера
   */
  async saveBaseUrl(provider: AIProvider, baseUrl: string): Promise<void> {
    const cookieStore = await cookies()
    const cookieName = `${BASE_URL_COOKIE_PREFIX}${provider}`

    // Устанавливаем куки с базовым URL
    cookieStore.set({
      name: cookieName,
      value: baseUrl,
      expires: new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
  }

  /**
   * Получает сохраненный базовый URL для указанного провайдера
   */
  async getBaseUrl(provider: AIProvider): Promise<string | undefined> {
    const cookieStore = await cookies()
    const cookieName = `${BASE_URL_COOKIE_PREFIX}${provider}`
    const baseUrlCookie = cookieStore.get(cookieName)

    return baseUrlCookie?.value
  }

  /**
   * Удаляет сохраненный API ключ для указанного провайдера
   */
  async deleteApiKey(provider: AIProvider): Promise<void> {
    const cookieStore = await cookies()
    const cookieName = `${API_KEY_COOKIE_PREFIX}${provider}`

    cookieStore.delete(cookieName)
  }

  /**
   * Удаляет сохраненный базовый URL для указанного провайдера
   */
  async deleteBaseUrl(provider: AIProvider): Promise<void> {
    const cookieStore = await cookies()
    const cookieName = `${BASE_URL_COOKIE_PREFIX}${provider}`

    cookieStore.delete(cookieName)
  }

  // Приватные методы для получения моделей от разных провайдеров

  private async getOpenAIModels(apiKey?: string): Promise<AIModel[]> {
    try {
      if (apiKey) {
        // Если предоставлен API ключ, получаем актуальный список моделей
        const openai = new OpenAI({ apiKey })
        const models = await openai.models.list()

        // Фильтруем только модели для чата и завершения
        const chatModels = models.data
          .filter(
            (model) =>
              model.id.includes('gpt') ||
              model.id.includes('text-davinci') ||
              model.id.includes('claude'),
          )
          .map((model) => ({
            id: model.id,
            name: this.formatModelName(model.id),
            provider: 'openai' as AIProvider,
          }))

        return chatModels
      } else {
        // Если API ключ не предоставлен, возвращаем дефолтные модели
        return this.getDefaultModels('openai')
      }
    } catch (error) {
      logError('Error fetching OpenAI models:', error)
      return this.getDefaultModels('openai')
    }
  }

  private async getGoogleModels(apiKey?: string): Promise<AIModel[]> {
    try {
      // Для Google всегда требуется API ключ для получения списка моделей
      logDebug('getGoogleModels called with apiKey:', apiKey ? `${apiKey.substring(0, 4)}...` : 'undefined',
      )

      if (apiKey) {
        try {
          // Если есть API ключ, пытаемся получить список моделей
          const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
          logDebug('Fetching Google models from URL:', url)

          const response = await fetch(url)
          logDebug('Google API response status:', response.status, response.statusText)

          if (!response.ok) {
            throw new Error(`Failed to fetch Google models: ${response.statusText}`)
          }

          const data = (await response.json()) as { models: GoogleModel[] }
          logDebug('Google API response data:', data)

          // Фильтруем только модели Gemini
          const googleModels = data.models
            .filter((model) => model.name.includes('gemini'))
            .map((model) => {
              // Формируем описание с характеристиками
              let description = ''

              // Добавляем информацию о контекстном окне
              if (model.inputTokenLimit) {
                const contextSize =
                  model.inputTokenLimit >= 1000000
                    ? '1M'
                    : model.inputTokenLimit >= 100000
                      ? '100K'
                      : model.inputTokenLimit >= 32000
                        ? '32K'
                        : `${model.inputTokenLimit}`
                description += `Контекст: ${contextSize} токенов`
              }

              // Добавляем информацию о мультимодальности
              if (model.name.includes('vision')) {
                description += description ? ' | Мультимодальная' : 'Мультимодальная'
              } else if (model.name.includes('flash')) {
                description += description ? ' | Быстрая' : 'Быстрая'
              } else if (model.inputTokenLimit) {
                description += description
                  ? ` | Вход: ${model.inputTokenLimit >= 1000000 ? '1M' : model.inputTokenLimit}`
                  : `Вход: ${model.inputTokenLimit >= 1000000 ? '1M' : model.inputTokenLimit}`
              }

              // Добавляем информацию о лимите выходных токенов
              if (model.outputTokenLimit) {
                description += description
                  ? ` | Выход: ${model.outputTokenLimit}`
                  : `Выход: ${model.outputTokenLimit}`
              }

              // Если нет информации о лимитах, используем оригинальное описание
              if (!description && model.description) {
                description = model.description
              }

              return {
                id: model.name, // Используем полное имя модели
                name:
                  model.displayName ||
                  this.formatModelName(model.name.split('/').pop() || model.name),
                description,
                maxTokens: model.outputTokenLimit,
                provider: 'google' as AIProvider,
              }
            })

          logDebug('Filtered Google models:', googleModels)
          return googleModels
        } catch (error) {
          logError('Error fetching Google models with API key:', error)
          // Если произошла ошибка при запросе с API ключом, возвращаем дефолтные модели
        }
      }

      logDebug('Returning default Google models')

      // Если API ключ не предоставлен, возвращаем дефолтные модели
      return [
        {
          id: 'models/gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Контекст: 1M токенов | Вход: 1M | Выход: 2048',
          provider: 'google',
        },
        {
          id: 'models/gemini-1.5-pro-vision',
          name: 'Gemini 1.5 Pro Vision',
          description: 'Контекст: 1M токенов | Мультимодальная | Выход: 2048',
          provider: 'google',
        },
        {
          id: 'models/gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Контекст: 1M токенов | Быстрая | Выход: 2048',
          provider: 'google',
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini Pro',
          description: 'Контекст: 32K токенов | Вход: 32K | Выход: 8192',
          provider: 'google',
        },
        {
          id: 'gemini-2.5-flash-vision',
          name: 'Gemini Pro Vision',
          description: 'Контекст: 32K токенов | Мультимодальная | Выход: 4096',
          provider: 'google',
        },
      ]
    } catch (error) {
      logError('Error fetching Google models:', error)

      // Если произошла ошибка, возвращаем дефолтные модели
      return [
        {
          id: 'models/gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Контекст: 1M токенов | Вход: 1M | Выход: 2048',
          provider: 'google',
        },
        {
          id: 'models/gemini-1.5-pro-vision',
          name: 'Gemini 1.5 Pro Vision',
          description: 'Контекст: 1M токенов | Мультимодальная | Выход: 2048',
          provider: 'google',
        },
        {
          id: 'models/gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Контекст: 1M токенов | Быстрая | Выход: 2048',
          provider: 'google',
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini Pro',
          description: 'Контекст: 32K токенов | Вход: 32K | Выход: 8192',
          provider: 'google',
        },
        {
          id: 'gemini-2.5-flash-vision',
          name: 'Gemini Pro Vision',
          description: 'Контекст: 32K токенов | Мультимодальная | Выход: 4096',
          provider: 'google',
        },
      ]
    }
  }

  private async getDeepSeekModels(apiKey?: string, baseUrl?: string): Promise<AIModel[]> {
    try {
      if (apiKey) {
        // Если предоставлен API ключ, получаем актуальный список моделей
        const deepseek = new OpenAI({
          apiKey,
          baseURL: baseUrl || 'https://api.deepseek.com/v1',
        })
        const models = await deepseek.models.list()

        // Фильтруем модели
        const deepseekModels = models.data.map((model) => ({
          id: model.id,
          name: model.id.includes('deepseek-') ? this.formatModelName(model.id) : model.id,
          provider: 'deepseek' as AIProvider,
        }))

        return deepseekModels
      } else {
        // Если API ключ не предоставлен, возвращаем дефолтные модели
        return [
          {
            id: 'deepseek-chat',
            name: 'DeepSeek Chat',
            description: 'Контекст: 32K токенов | Текстовая | Выход: 4096',
            provider: 'deepseek',
          },
          {
            id: 'deepseek-coder',
            name: 'DeepSeek Coder',
            description: 'Контекст: 32K токенов | Кодинг | Выход: 4096',
            provider: 'deepseek',
          },
          {
            id: 'deepseek-llm-67b-chat',
            name: 'DeepSeek LLM 67B Chat',
            description: 'Контекст: 32K токенов | 67B параметров | Выход: 4096',
            provider: 'deepseek',
          },
          {
            id: 'deepseek-coder-instruct',
            name: 'DeepSeek Coder Instruct',
            description: 'Контекст: 32K токенов | Кодинг | Выход: 4096',
            provider: 'deepseek',
          },
        ]
      }
    } catch (error) {
      logError('Error fetching DeepSeek models:', error)
      return [
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          description: 'Основная модель для диалогов',
          provider: 'deepseek',
        },
        {
          id: 'deepseek-coder',
          name: 'DeepSeek Coder',
          description: 'Специализированная модель для программирования',
          provider: 'deepseek',
        },
        {
          id: 'deepseek-llm-67b-chat',
          name: 'DeepSeek LLM 67B Chat',
          description: 'Мощная модель для диалогов на основе 67B параметров',
          provider: 'deepseek',
        },
        {
          id: 'deepseek-coder-instruct',
          name: 'DeepSeek Coder Instruct',
          description: 'Модель для программирования с инструкциями',
          provider: 'deepseek',
        },
      ]
    }
  }

  private getAnthropicModels(): AIModel[] {
    // Anthropic модели
    return [
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Контекст: 200K токенов | Мультимодальная | Выход: 4096',
        provider: 'anthropic',
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Контекст: 200K токенов | Мультимодальная | Выход: 4096',
        provider: 'anthropic',
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Контекст: 200K токенов | Мультимодальная | Выход: 4096',
        provider: 'anthropic',
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Контекст: 200K токенов | Мультимодальная | Выход: 4096',
        provider: 'anthropic',
      },
      {
        id: 'claude-2.1',
        name: 'Claude 2.1',
        description: 'Контекст: 100K токенов | Текстовая | Выход: 4096',
        provider: 'anthropic',
      },
    ]
  }

  private async getOpenRouterModels(_apiKey?: string): Promise<AIModel[]> {
    try {
      // OpenRouter предоставляет публичный API для списка моделей без ключа
      // Всегда пытаемся получить список моделей без ключа
      const response = await fetch('https://openrouter.ai/api/v1/models')

      if (!response.ok) {
        throw new Error(`Failed to fetch OpenRouter models: ${response.statusText}`)
      }

      const data = (await response.json()) as { data: OpenRouterModel[] }

      // Фильтруем модели
      const openrouterModels = data.data.map((model) => ({
        id: model.id,
        name: model.id.split(':').pop() || model.id,
        description: `${model.id.split(':')[0]}`,
        provider: 'openrouter' as AIProvider,
      }))

      return openrouterModels
    } catch (error) {
      logError('Error fetching OpenRouter models:', error)

      // Если произошла ошибка, возвращаем дефолтные модели
      return [
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          description: 'Контекст: 128K токенов | Мультимодальная | Выход: 4096',
          provider: 'openrouter',
        },
        {
          id: 'anthropic/claude-3-opus',
          name: 'Claude 3 Opus',
          description: 'Контекст: 200K токенов | Мультимодальная | Выход: 4096',
          provider: 'openrouter',
        },
        {
          id: 'meta-llama/llama-3-70b-instruct',
          name: 'Llama 3 70B Instruct',
          description: 'Контекст: 8K токенов | 70B параметров | Выход: 4096',
          provider: 'openrouter',
        },
      ]
    }
  }

  private getRequestyModels(): AIModel[] {
    // Requesty модели
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Контекст: 128K | OpenAI через Requesty',
        provider: 'requesty',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Контекст: 128K | OpenAI через Requesty',
        provider: 'requesty',
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Контекст: 200K | Anthropic через Requesty',
        provider: 'requesty',
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Контекст: 200K | Anthropic через Requesty',
        provider: 'requesty',
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Контекст: 200K | Anthropic через Requesty',
        provider: 'requesty',
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Контекст: 200K | Anthropic через Requesty',
        provider: 'requesty',
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Контекст: 1M | Google через Requesty',
        provider: 'requesty',
      },
      {
        id: 'mistral-large-2',
        name: 'Mistral Large 2',
        description: 'Контекст: 32K | Mistral через Requesty',
        provider: 'requesty',
      },
    ]
  }

  private async getMistralModels(apiKey?: string, baseUrl?: string): Promise<AIModel[]> {
    try {
      if (apiKey) {
        // Если предоставлен API ключ, получаем актуальный список моделей
        const mistral = new OpenAI({
          apiKey,
          baseURL: baseUrl || 'https://api.mistral.ai/v1',
        })
        const models = await mistral.models.list()

        // Фильтруем модели
        const mistralModels = models.data.map((model) => ({
          id: model.id,
          name: model.id.replace('mistral-', '').replace('-', ' '),
          provider: 'mistral' as AIProvider,
        }))

        return mistralModels
      } else {
        // Если API ключ не предоставлен, возвращаем дефолтные модели
        return [
          {
            id: 'mistral-large-2',
            name: 'Mistral Large 2',
            description: 'Контекст: 32K токенов | Текстовая | Выход: 8192',
            provider: 'mistral',
          },
          {
            id: 'mistral-large-latest',
            name: 'Mistral Large',
            description: 'Контекст: 32K токенов | Текстовая | Выход: 8192',
            provider: 'mistral',
          },
          {
            id: 'mistral-medium-latest',
            name: 'Mistral Medium',
            description: 'Контекст: 32K токенов | Текстовая | Выход: 8192',
            provider: 'mistral',
          },
          {
            id: 'mistral-small-latest',
            name: 'Mistral Small',
            description: 'Контекст: 32K токенов | Текстовая | Выход: 8192',
            provider: 'mistral',
          },
          {
            id: 'open-mistral-7b',
            name: 'Open Mistral 7B',
            description: 'Контекст: 8K токенов | Текстовая | Выход: 2048',
            provider: 'mistral',
          },
        ]
      }
    } catch (error) {
      logError('Error fetching Mistral models:', error)
      return [
        {
          id: 'mistral-large-2',
          name: 'Mistral Large 2',
          description: 'Новейшая и самая мощная модель Mistral',
          provider: 'mistral',
        },
        {
          id: 'mistral-large-latest',
          name: 'Mistral Large',
          description: 'Мощная модель Mistral',
          provider: 'mistral',
        },
        {
          id: 'mistral-medium-latest',
          name: 'Mistral Medium',
          description: 'Сбалансированная модель',
          provider: 'mistral',
        },
      ]
    }
  }

  private async getOpenAICompatibleModels(apiKey?: string, baseUrl?: string): Promise<AIModel[]> {
    try {
      if (apiKey && baseUrl) {
        // Если предоставлены API ключ и baseUrl, получаем актуальный список моделей
        const openaiCompatible = new OpenAI({
          apiKey,
          baseURL: baseUrl,
        })
        const models = await openaiCompatible.models.list()

        // Фильтруем модели
        const compatibleModels = models.data.map((model) => ({
          id: model.id,
          name: this.formatModelName(model.id),
          provider: 'openai-compatible' as AIProvider,
        }))

        return compatibleModels
      } else {
        // Если API ключ или baseUrl не предоставлены, возвращаем пустой список
        return [
          {
            id: 'compatible-model',
            name: 'Compatible Model',
            description: 'Укажите API ключ и URL для получения списка моделей',
            provider: 'openai-compatible',
          },
        ]
      }
    } catch (error) {
      logError('Error fetching OpenAI Compatible models:', error)
      return [
        {
          id: 'compatible-model',
          name: 'Compatible Model',
          description: 'Ошибка получения списка моделей. Проверьте URL и API ключ.',
          provider: 'openai-compatible',
        },
      ]
    }
  }

  private async getDefaultModels(provider: AIProvider): Promise<AIModel[]> {
    switch (provider) {
      case 'openai':
        return [
          {
            id: 'gpt-4o',
            name: 'GPT-4o',
            description: 'Контекст: 128K токенов | Мультимодальная | Выход: 4096',
            provider: 'openai',
          },
          {
            id: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            description: 'Контекст: 128K токенов | Мультимодальная | Выход: 4096',
            provider: 'openai',
          },
          {
            id: 'gpt-4-turbo',
            name: 'GPT-4 Turbo',
            description: 'Контекст: 128K токенов | Текстовая | Выход: 4096',
            provider: 'openai',
          },
          {
            id: 'gpt-4-vision-preview',
            name: 'GPT-4 Vision',
            description: 'Контекст: 128K токенов | Мультимодальная | Выход: 4096',
            provider: 'openai',
          },
          {
            id: 'gpt-4',
            name: 'GPT-4',
            description: 'Контекст: 8K токенов | Текстовая | Выход: 4096',
            provider: 'openai',
          },
          {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            description: 'Контекст: 16K токенов | Текстовая | Выход: 4096',
            provider: 'openai',
          },
          {
            id: 'dall-e-3',
            name: 'DALL-E 3',
            description: 'Генерация изображений | 1024x1024 | 1024x1792 | 1792x1024',
            provider: 'openai',
          },
        ]
      case 'google':
        return this.getGoogleModels()
      case 'deepseek':
        return await this.getDeepSeekModels()
      case 'anthropic':
        return this.getAnthropicModels()
      case 'openrouter':
        return await this.getOpenRouterModels()
      case 'requesty':
        return this.getRequestyModels()
      case 'mistral':
        return await this.getMistralModels()
      case 'openai-compatible':
        return await this.getOpenAICompatibleModels()
      default:
        return []
    }
  }

  // Вспомогательный метод для форматирования имен моделей
  private formatModelName(modelId: string): string {
    // Удаляем префиксы провайдеров
    let name = modelId
      .replace(/^openai\//, '')
      .replace(/^anthropic\//, '')
      .replace(/^meta-llama\//, '')
      .replace(/^mistral-/, '')
      .replace(/^deepseek-/, '')

    // Заменяем дефисы и подчеркивания на пробелы
    name = name.replace(/[-_]/g, ' ')

    // Преобразуем id модели в более читаемое имя
    name = name
      .replace('gpt', 'GPT')
      .replace('GPT ', 'GPT-')
      .replace(' turbo', ' Turbo')
      .replace(' vision', ' Vision')
      .replace(' preview', ' Preview')
      .replace('text davinci ', 'Davinci ')
      .replace('claude ', 'Claude ')
      .replace('claude', 'Claude')

    // Преобразуем первые буквы слов в заглавные
    name = name.replace(/\b\w/g, (c) => c.toUpperCase())

    return name
  }
}

// Экспортируем функцию для получения экземпляра сервиса
export function getProviderService(): ProviderService {
  return new ProviderService()
}
