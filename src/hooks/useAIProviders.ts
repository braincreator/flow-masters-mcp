import { useState, useEffect, useCallback } from 'react'
import { AIProvider, AIModel } from '@/services/ai/providerService'

interface UseAIProvidersOptions {
  initialProvider?: AIProvider
}

interface UseAIProvidersReturn {
  providers: { id: AIProvider; name: string }[]
  selectedProvider: AIProvider
  setSelectedProvider: (provider: AIProvider) => void
  models: AIModel[]
  selectedModel: string | null
  setSelectedModel: (modelId: string) => void
  apiKey: string
  setApiKey: (key: string) => void
  isLoadingModels: boolean
  hasStoredApiKey: boolean
  validateApiKey: (key: string) => Promise<boolean>
  saveApiKey: (key: string) => Promise<boolean>
  deleteApiKey: () => Promise<boolean>
  loadModels: (shouldSetDefaultModel?: boolean) => Promise<void>
  error: string | null
}

/**
 * Хук для работы с провайдерами AI и их моделями
 */
export function useAIProviders(options?: UseAIProvidersOptions): UseAIProvidersReturn {
  const initialProvider = options?.initialProvider || 'openai'

  // Состояния
  const [providers] = useState<{ id: AIProvider; name: string }[]>([
    { id: 'openai', name: 'OpenAI' },
    { id: 'google', name: 'Google Gemini' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'anthropic', name: 'Anthropic' },
  ])
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(initialProvider)
  const [models, setModels] = useState<AIModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false)
  const [hasStoredApiKey, setHasStoredApiKey] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Загрузка списка моделей для выбранного провайдера
  const loadModels = useCallback(
    async (shouldSetDefaultModel = true) => {
      setIsLoadingModels(true)
      setError(null)

      try {
        // Проверяем наличие сохраненного ключа для текущего провайдера
        const keyResponse = await fetch(`/api/v1/ai/providers/keys?provider=${selectedProvider}`)
        const keyData = await keyResponse.json()
        const hasKey = keyData.success && keyData.hasKey

        // Загружаем модели с использованием сохраненного ключа, если он есть
        const url = `/api/v1/ai/providers/models?provider=${selectedProvider}`
        const response = await fetch(url)
        const data = await response.json()

        if (data.success) {
          setModels(data.data)

          // Выбираем первую модель по умолчанию, если список не пуст и флаг установлен
          if (data.data.length > 0 && shouldSetDefaultModel) {
            setSelectedModel(data.data[0].id)
          }

          // Обновляем статус наличия сохраненного ключа
          setHasStoredApiKey(hasKey)
        } else {
          setError(data.error || 'Failed to load models')
          setModels([])
        }
      } catch (err) {
        console.error('Error loading models:', err)
        setError('Failed to load models. Please try again.')
        setModels([])
      } finally {
        setIsLoadingModels(false)
      }
    },
    [selectedProvider],
  )

  // Проверка наличия сохраненного API ключа
  const checkStoredApiKey = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/ai/providers/keys?provider=${selectedProvider}`)
      const data = await response.json()

      if (data.success) {
        setHasStoredApiKey(data.hasKey)
      } else {
        setHasStoredApiKey(false)
      }
    } catch (err) {
      console.error('Error checking stored API key:', err)
      setHasStoredApiKey(false)
    }
  }, [selectedProvider])

  // Валидация API ключа
  const validateApiKey = useCallback(
    async (key: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/v1/ai/providers/validate-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: selectedProvider,
            apiKey: key,
          }),
        })

        const data = await response.json()
        return data.success && data.isValid
      } catch (err) {
        console.error('Error validating API key:', err)
        return false
      }
    },
    [selectedProvider],
  )

  // Сохранение API ключа
  const saveApiKey = useCallback(
    async (key: string): Promise<boolean> => {
      try {
        const response = await fetch('/api/v1/ai/providers/keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: selectedProvider,
            apiKey: key,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setHasStoredApiKey(true)
          // Загружаем актуальный список моделей после сохранения ключа
          await loadModels(true)
          return true
        } else {
          setError(data.error || 'Failed to save API key')
          return false
        }
      } catch (err) {
        console.error('Error saving API key:', err)
        setError('Failed to save API key. Please try again.')
        return false
      }
    },
    [selectedProvider, loadModels],
  )

  // Удаление API ключа
  const deleteApiKey = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/ai/providers/keys?provider=${selectedProvider}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setHasStoredApiKey(false)
        setApiKey('')
        // Загружаем актуальный список моделей после удаления ключа
        await loadModels(true)
        return true
      } else {
        setError(data.error || 'Failed to delete API key')
        return false
      }
    } catch (err) {
      console.error('Error deleting API key:', err)
      setError('Failed to delete API key. Please try again.')
      return false
    }
  }, [selectedProvider, loadModels])

  // Эффект при изменении провайдера
  useEffect(() => {
    // Сначала сбрасываем выбранную модель и ключ
    setSelectedModel(null)
    setApiKey('')

    // Затем загружаем модели и проверяем наличие сохраненного ключа
    loadModels(true) // Устанавливаем модель по умолчанию
    checkStoredApiKey()
  }, [selectedProvider, loadModels, checkStoredApiKey])

  // Эффект при первой загрузке компонента
  useEffect(() => {
    // Загружаем модели при первой загрузке
    loadModels(true)
    checkStoredApiKey()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    providers,
    selectedProvider,
    setSelectedProvider,
    models,
    selectedModel,
    setSelectedModel,
    apiKey,
    setApiKey,
    isLoadingModels,
    hasStoredApiKey,
    validateApiKey,
    saveApiKey,
    deleteApiKey,
    loadModels,
    error,
  }
}
