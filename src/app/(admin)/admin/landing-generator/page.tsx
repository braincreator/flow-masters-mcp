'use client'

import React, { useState, useEffect, useCallback } from 'react'
import '@/app/globals.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Zap, CheckCircle, Key, Loader2, Database, Code2, ExternalLink } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import LandingPreview from '@/components/admin/LandingPreview'
import { useAIProviders } from '@/hooks/useAIProviders'
import { AIProvider } from '@/services/ai/providerService'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface LandingOptions {
  focus: 'leads' | 'sales' | 'awareness' | 'engagement'
  utp?: string
}

export default function LandingGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<LandingOptions>({
    focus: 'leads',
    utp: '',
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Используем хук для работы с провайдерами AI и их моделями
  const {
    providers,
    selectedProvider,
    setSelectedProvider,
    // Не используем models из хука, так как у нас есть свой список localModels
    selectedModel,
    setSelectedModel,
    apiKey,
    setApiKey,
    // Не используем isLoadingModels из хука, так как у нас есть свой флаг isLocalLoading
    hasStoredApiKey,
    validateApiKey,
    saveApiKey,
    deleteApiKey,
    // Не используем loadModels из хука, так как у нас есть своя функция fetchModelsDirectly
    error: providerError,
  } = useAIProviders()

  // Состояние для источника API ключа
  const [apiKeySource, setApiKeySource] = useState<'stored' | 'manual' | 'env'>('env')

  // Обновляем источник API ключа при изменении статуса сохраненного ключа
  useEffect(() => {
    // Если есть сохраненный ключ и источник не 'manual', устанавливаем 'stored'
    if (hasStoredApiKey && apiKeySource !== 'manual') {
      setApiKeySource('stored')
    }
    // Если нет сохраненного ключа и источник 'stored', меняем на 'env'
    else if (!hasStoredApiKey && apiKeySource === 'stored') {
      setApiKeySource('env')
    }
  }, [hasStoredApiKey, apiKeySource])

  // Обновляем сообщение об ошибке при изменении ошибки провайдера
  useEffect(() => {
    if (providerError) {
      setError(providerError)
    }
  }, [providerError])

  // Создаем собственный список моделей
  const [localModels, setLocalModels] = useState<
    Array<{ id: string; name: string; description?: string }>
  >([])
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false)

  // Функция для загрузки моделей напрямую с сервера
  const fetchModelsDirectly = useCallback(async () => {
    try {
      setIsLocalLoading(true)
      setError(null)

      logDebug('Загружаем модели для провайдера:', selectedProvider)

      // Запрашиваем список моделей напрямую
      let url = `/api/v1/ai/providers/models?provider=${selectedProvider}`

      // Если есть API ключ, добавляем его в запрос
      if (apiKey) {
        // Добавляем API ключ в запрос независимо от источника
        url += `&apiKey=${encodeURIComponent(apiKey)}`
        logDebug('Adding API key to request, source:', apiKeySource)
      } else {
        logDebug('No API key available, source:', apiKeySource)
      }

      logDebug('Запрашиваем модели по URL:', url)

      const response = await fetch(url)
      const data = await response.json()

      logDebug('Полученный ответ:', data)

      if (data.success) {
        logDebug('Список моделей от сервера:', data.data)
        setLocalModels(data.data)

        // Если есть модели, выбираем первую по умолчанию
        if (data.data.length > 0) {
          setSelectedModel(data.data[0].id)
        }

        setSuccess('Список моделей обновлен')
        setTimeout(() => setSuccess(null), 3000) // Скрываем сообщение через 3 секунды
      } else {
        logError('Ошибка при получении моделей:', data.error)
        setError(data.error || 'Ошибка загрузки моделей')
        setLocalModels([])
      }
    } catch (err) {
      logError('Error loading models:', err)
      setError('Ошибка загрузки моделей. Пожалуйста, попробуйте еще раз.')
      setLocalModels([])
    } finally {
      setIsLocalLoading(false)
    }
  }, [
    selectedProvider,
    setSelectedModel,
    setLocalModels,
    setSuccess,
    setError,
    setIsLocalLoading,
    apiKey,
    apiKeySource,
  ])

  // Загружаем список моделей при изменении провайдера
  useEffect(() => {
    // Если источник API ключа - 'stored', получаем сохраненный ключ
    const loadStoredKey = async () => {
      if (apiKeySource === 'stored' && !apiKey) {
        try {
          // Получаем сохраненный ключ для текущего провайдера
          const response = await fetch(`/api/v1/ai/providers/keys?provider=${selectedProvider}`)
          const data = await response.json()

          if (data.success && data.hasKey) {
            logDebug('Found stored API key for provider:', selectedProvider)
          }
        } catch (err) {
          logError('Error checking stored API key:', err)
        }
      }

      // Загружаем модели
      fetchModelsDirectly()
    }

    loadStoredKey()
  }, [selectedProvider, fetchModelsDirectly, apiKeySource, apiKey])

  // Мы удаляем этот useEffect, так как модели будут загружены при изменении провайдера
  // и при первой загрузке страницы тоже, так как selectedProvider уже установлен

  // Состояние для выбора типа генерации
  const [generationType, setGenerationType] = useState<'html' | 'cms'>('cms')
  const [pageTitle, setPageTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [createdPageUrl, setCreatedPageUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setError(null)
      setGeneratedContent(null)
      setCreatedPageUrl(null)

      // Проверяем, что выбрана модель
      if (!selectedModel) {
        setError('Выберите модель AI перед генерацией')
        setLoading(false)
        return
      }

      // Выбираем эндпоинт в зависимости от типа генерации
      // Всегда используем пути API без префикса локализации
      const endpoint =
        generationType === 'cms'
          ? `${window.location.origin}/api/v1/landings/generate-cms`
          : `${window.location.origin}/api/v1/landings/generate`

      let result

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            focus: options.focus,
            utp: options.utp,
            title: pageTitle.trim(),
            slug: pageSlug.trim(),
            llmProvider: selectedProvider,
            llmModel: selectedModel,
            apiKey: apiKey, // Передаем API ключ, если он есть
          }),
        })

        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          throw new Error(
            'Получен HTML вместо JSON. Пожалуйста, попробуйте еще раз или выберите другую модель.',
          )
        }

        result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Ошибка генерации лендинга')
        }

        if (generationType === 'cms') {
          // Если создана страница в CMS, показываем ссылку на нее
          setCreatedPageUrl(`/admin/collections/pages/${result.data.page.id}`)
          setSuccess(`Страница успешно создана: ${result.data.page.title}`)
        } else {
          // Если генерируем HTML, показываем его
          setSuccess('Лендинг успешно сгенерирован!')
          setGeneratedContent(result.data.content)
        }
      } catch (fetchError) {
        if (fetchError instanceof SyntaxError) {
          // Ошибка парсинга JSON
          logError('JSON parsing error:', fetchError)
          throw new Error(
            'Ошибка парсинга ответа. Пожалуйста, попробуйте еще раз или выберите другую модель.',
          )
        }
        throw fetchError
      }
    } catch (err) {
      logError('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка при генерации лендинга')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing-generator-page">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 border-none shadow-md bg-gradient-to-r from-teal-600 to-emerald-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-white">Генератор лендингов</h1>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-white/20 hover:bg-white/30 text-white"
                  >
                    Сгенерировано с помощью AI
                  </Badge>
                </div>
                <p className="text-emerald-100 mt-1">
                  Создавайте высококонверсионные лендинги с помощью AI
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <LandingPreview content={generatedContent} />
          </div>

          <div className="space-y-6 md:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Фокус лендинга</Label>
                  <Select
                    value={options.focus}
                    onValueChange={(value) =>
                      setOptions({
                        ...options,
                        focus: value as 'leads' | 'sales' | 'awareness' | 'engagement',
                      })
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Выберите фокус лендинга" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="leads">Сбор лидов</SelectItem>
                      <SelectItem value="sales">Продажи</SelectItem>
                      <SelectItem value="awareness">Вовлечение</SelectItem>
                      <SelectItem value="engagement">Взаимодействие</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>УТП (опционально)</Label>
                  <Input
                    placeholder="Ваше уникальное торговое предложение"
                    value={options.utp || ''}
                    onChange={(e) => setOptions({ ...options, utp: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Тип генерации</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={generationType === 'cms' ? 'default' : 'outline'}
                      onClick={() => setGenerationType('cms')}
                      className="flex-1"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Создать страницу в CMS
                    </Button>
                    <Button
                      type="button"
                      variant={generationType === 'html' ? 'default' : 'outline'}
                      onClick={() => setGenerationType('html')}
                      className="flex-1"
                    >
                      <Code2 className="h-4 w-4 mr-2" />
                      Сгенерировать HTML
                    </Button>
                  </div>
                </div>

                {generationType === 'cms' && (
                  <div className="space-y-4 border rounded-md p-4 bg-slate-50">
                    <h3 className="text-sm font-medium">Настройки страницы в CMS</h3>
                    <div className="space-y-2">
                      <Label>Заголовок страницы (опционально)</Label>
                      <Input
                        placeholder="Заголовок страницы"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Если не указан, будет сгенерирован автоматически
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Slug страницы (опционально)</Label>
                      <Input
                        placeholder="slug-stranitsy"
                        value={pageSlug}
                        onChange={(e) => setPageSlug(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Если не указан, будет сгенерирован из заголовка
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>AI Провайдер</Label>
                  <Select
                    value={selectedProvider}
                    onValueChange={(value) => {
                      setSelectedProvider(value as AIProvider)
                    }}
                  >
                    <SelectTrigger id="provider" className="bg-white">
                      <SelectValue placeholder="Выберите провайдера" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {apiKeySource === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Ключ</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Введите API ключ"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            // Проверяем, что ключ не пустой
                            if (!apiKey.trim()) {
                              setError('Введите API ключ')
                              return
                            }

                            // Очищаем предыдущие сообщения
                            setError(null)
                            setSuccess(null)

                            logDebug('Проверяем API ключ для провайдера:', selectedProvider)

                            // Проверяем валидность ключа
                            const isValid = await validateApiKey(apiKey)
                            logDebug('Результат проверки ключа:', isValid)

                            if (isValid) {
                              // Сохраняем ключ
                              logDebug('Сохраняем API ключ...')
                              const saved = await saveApiKey(apiKey)
                              logDebug('Результат сохранения ключа:', saved)

                              if (saved) {
                                setApiKeySource('stored')
                                // Загружаем актуальный список моделей после сохранения ключа
                                await fetchModelsDirectly()
                                setSuccess('Ключ успешно сохранен')
                              } else {
                                setError('Ошибка сохранения ключа')
                              }
                            } else {
                              setError('Неверный API ключ')
                            }
                          } catch (err) {
                            logError('Ошибка при сохранении API ключа:', err)
                            setError(
                              err instanceof Error
                                ? err.message
                                : 'Произошла ошибка при сохранении ключа',
                            )
                          }
                        }}
                        title="Сохранить ключ"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {apiKeySource === 'stored' && (
                  <div className="space-y-2">
                    <Label>API Ключ</Label>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Используется сохраненный ключ
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setApiKeySource('manual')}
                        >
                          Изменить
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Очищаем предыдущие сообщения
                              setError(null)
                              setSuccess(null)

                              logDebug('Удаляем API ключ для провайдера:', selectedProvider)

                              // Удаляем ключ
                              const deleted = await deleteApiKey()
                              logDebug('Результат удаления ключа:', deleted)

                              if (deleted) {
                                setApiKeySource('env')
                                setSuccess('Ключ успешно удален')
                                // Загружаем актуальный список моделей после удаления ключа
                                await fetchModelsDirectly()
                              } else {
                                setError('Ошибка удаления ключа')
                              }
                            } catch (err) {
                              logError('Ошибка при удалении API ключа:', err)
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : 'Произошла ошибка при удалении ключа',
                              )
                            }
                          }}
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {apiKeySource === 'env' && (
                  <div className="space-y-2">
                    <Label>API Ключ</Label>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Используется ключ из переменных окружения
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setApiKeySource('manual')}
                      >
                        Изменить
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="model">Модель AI</Label>
                    <div className="flex items-center gap-2">
                      {isLocalLoading ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          <span>Загрузка...</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={fetchModelsDirectly}
                          title="Обновить список моделей"
                        >
                          <Loader2 className="h-3 w-3 mr-1" />
                          Обновить
                        </Button>
                      )}
                    </div>
                  </div>
                  <Select
                    value={selectedModel || ''}
                    onValueChange={setSelectedModel}
                    disabled={isLocalLoading}
                  >
                    <SelectTrigger id="model" className="bg-white">
                      {isLocalLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Загрузка моделей...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Выберите модель" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {localModels.length > 0 ? (
                        localModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                            {model.description && (
                              <span className="text-xs text-muted-foreground ml-2">
                                - {model.description}
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          {isLocalLoading ? 'Загрузка моделей...' : 'Нет доступных моделей'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {localModels.length === 0 && !isLocalLoading && (
                    <div className="text-xs text-amber-600 mt-1">
                      Нет доступных моделей. Проверьте API ключ или выберите другого провайдера.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <span className="animate-pulse">Генерация...</span>
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Сгенерировать лендинг
                </>
              )}
            </Button>

            {success && (
              <div className="p-4 bg-green-50 rounded-md border border-green-200 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>{success}</span>
                {createdPageUrl && (
                  <a
                    href={createdPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-sm text-green-600 hover:text-green-800 transition-colors"
                  >
                    Перейти к странице
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 rounded-md border border-red-200 flex items-center gap-2">
                <span className="h-5 w-5 text-red-600">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
