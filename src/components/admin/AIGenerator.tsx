'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, Sparkles, Eye, Code, Key, Trash2 } from 'lucide-react'
import { useAIProviders } from '@/hooks/useAIProviders'
import { AIProvider } from '@/services/ai/providerService'

interface AIGeneratorProps {
  onGeneratedContent: (content: string) => void
  onPreview?: () => void
}

export function AIGenerator({ onGeneratedContent, onPreview }: AIGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [generatedData, setGeneratedData] = useState<string | null>(null)

  const [topic, setTopic] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState<string>('beginner')
  const [includeQuizzes, setIncludeQuizzes] = useState(true)
  const [includeLanding, setIncludeLanding] = useState(true)
  const [includeFunnel, setIncludeFunnel] = useState(true)
  const [language, setLanguage] = useState<string>('ru')
  const [moduleCount, setModuleCount] = useState<number>(3)
  const [lessonCount, setLessonCount] = useState<number>(3)
  // Используем хук для работы с провайдерами и моделями
  const {
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
    saveApiKey: saveProviderApiKey,
    deleteApiKey,
    loadModels,
    // Игнорируем ошибки провайдера, т.к. у нас есть свое состояние ошибки
    error: _providerError,
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
  const [temperature, setTemperature] = useState<number>(0.7)
  const [style, setStyle] = useState<string>('professional')
  const [focus, setFocus] = useState<string>('balanced')
  const [industrySpecific, setIndustrySpecific] = useState('')
  const [includeResources, setIncludeResources] = useState(false)
  const [includeAssignments, setIncludeAssignments] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Пожалуйста, укажите тему курса')
      return
    }

    if (apiKeySource === 'manual' && !apiKey.trim()) {
      setError('Пожалуйста, укажите API ключ или выберите другой источник API ключа')
      return
    }

    // Проверяем, что модель выбрана
    if (!selectedModel) {
      setError('Пожалуйста, выберите модель AI')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Если пользователь ввел ключ вручную и выбрал опцию сохранения, сохраняем его
      if (apiKeySource === 'manual' && apiKey.trim()) {
        const isValid = await validateApiKey(apiKey)
        if (!isValid) {
          setError('Неверный API ключ. Пожалуйста, проверьте и попробуйте снова.')
          setLoading(false)
          return
        }

        // Спрашиваем пользователя, хочет ли он сохранить ключ
        const shouldSave = window.confirm(
          'Хотите сохранить этот API ключ для будущего использования?',
        )

        if (shouldSave) {
          await saveProviderApiKey(apiKey)
          setApiKeySource('stored')
        }
      }

      // Отправляем запрос на генерацию курса
      const response = await fetch('/api/v1/ai/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          targetAudience: targetAudience || undefined,
          difficultyLevel,
          includeQuizzes,
          includeLanding,
          includeFunnel,
          language,
          moduleCount,
          lessonCount,
          provider: selectedProvider,
          model: selectedModel,
          apiKey: apiKeySource === 'manual' ? apiKey : undefined, // Отправляем ключ только если он введен вручную
          temperature,
          style,
          focus,
          industrySpecific: industrySpecific || undefined,
          includeResources,
          includeAssignments,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при генерации курса')
      }

      // Преобразуем результат в строку JSON
      const jsonString = JSON.stringify(result.data, null, 2)

      // Сохраняем сгенерированные данные
      setGeneratedData(jsonString)

      setSuccess(
        'Курс успешно сгенерирован! Теперь вы можете создать его в CMS или отредактировать данные.',
      )
    } catch (error) {
      console.error('Error generating course:', error)
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Генерация курса с помощью AI</CardTitle>
        <CardDescription>Укажите параметры для генерации курса</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Тема курса</Label>
          <Input
            id="topic"
            placeholder="Например: Основы программирования на Python"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Целевая аудитория (опционально)</Label>
          <Input
            id="targetAudience"
            placeholder="Например: Начинающие разработчики без опыта"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficultyLevel">Уровень сложности</Label>
            <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
              <SelectTrigger id="difficultyLevel">
                <SelectValue placeholder="Выберите уровень сложности" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Начинающий</SelectItem>
                <SelectItem value="intermediate">Средний</SelectItem>
                <SelectItem value="advanced">Продвинутый</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Язык</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Выберите язык" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Дополнительные опции</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeQuizzes"
                checked={includeQuizzes}
                onCheckedChange={(checked) => setIncludeQuizzes(checked as boolean)}
              />
              <Label htmlFor="includeQuizzes">Включить тесты и задания</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeLanding"
                checked={includeLanding}
                onCheckedChange={(checked) => setIncludeLanding(checked as boolean)}
              />
              <Label htmlFor="includeLanding">Создать лендинг</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFunnel"
                checked={includeFunnel}
                onCheckedChange={(checked) => setIncludeFunnel(checked as boolean)}
              />
              <Label htmlFor="includeFunnel">Создать воронку</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeResources"
                checked={includeResources}
                onCheckedChange={(checked) => setIncludeResources(checked as boolean)}
              />
              <Label htmlFor="includeResources">Добавить полезные ресурсы</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeAssignments"
                checked={includeAssignments}
                onCheckedChange={(checked) => setIncludeAssignments(checked as boolean)}
              />
              <Label htmlFor="includeAssignments">Добавить практические задания</Label>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Скрыть расширенные настройки' : 'Показать расширенные настройки'}
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <h3 className="text-lg font-medium">Расширенные настройки</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moduleCount">Количество модулей</Label>
                <Input
                  id="moduleCount"
                  type="number"
                  min="1"
                  max="10"
                  value={moduleCount}
                  onChange={(e) => setModuleCount(parseInt(e.target.value) || 3)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessonCount">Уроков в модуле</Label>
                <Input
                  id="lessonCount"
                  type="number"
                  min="1"
                  max="10"
                  value={lessonCount}
                  onChange={(e) => setLessonCount(parseInt(e.target.value) || 3)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industrySpecific">Специфика отрасли (опционально)</Label>
              <Input
                id="industrySpecific"
                placeholder="Например: IT, маркетинг, финансы"
                value={industrySpecific}
                onChange={(e) => setIndustrySpecific(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">AI Провайдер</Label>
                <Select
                  value={selectedProvider}
                  onValueChange={(value) => {
                    setSelectedProvider(value as AIProvider)
                  }}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Выберите провайдера" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKeySource">Источник API ключа</Label>
                <Select
                  value={apiKeySource}
                  onValueChange={(value) => {
                    setApiKeySource(value as 'stored' | 'manual' | 'env')
                    // Если выбран ручной ввод, очищаем поле
                    if (value === 'manual') {
                      setApiKey('')
                    }
                    // Загружаем актуальный список моделей при изменении источника ключа
                    if (value === 'stored') {
                      // Загружаем модели с использованием сохраненного ключа
                      loadModels(true)
                    }
                  }}
                >
                  <SelectTrigger id="apiKeySource">
                    <SelectValue placeholder="Выберите источник" />
                  </SelectTrigger>
                  <SelectContent>
                    {hasStoredApiKey && <SelectItem value="stored">Сохраненный ключ</SelectItem>}
                    <SelectItem value="env">Из переменных окружения</SelectItem>
                    <SelectItem value="manual">Ввести вручную</SelectItem>
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
                        if (!apiKey.trim()) return

                        const isValid = await validateApiKey(apiKey)
                        if (isValid) {
                          await saveProviderApiKey(apiKey)
                          setApiKeySource('stored')
                          // Загружаем актуальный список моделей после сохранения ключа
                          await loadModels(true)
                          setSuccess('Ключ успешно сохранен')
                        } else {
                          setError('Неверный API ключ')
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
                  <Label htmlFor="storedKey">Сохраненный ключ</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="storedKey"
                      type="password"
                      value="********"
                      disabled
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={async () => {
                        if (window.confirm('Вы уверены, что хотите удалить сохраненный ключ?')) {
                          await deleteApiKey()
                          setApiKeySource('env')
                          // Загружаем актуальный список моделей после удаления ключа
                          await loadModels(true)
                          setSuccess('Ключ успешно удален')
                        }
                      }}
                      title="Удалить ключ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="model">Модель AI</Label>
                <Select
                  value={selectedModel || ''}
                  onValueChange={setSelectedModel}
                  disabled={isLoadingModels}
                >
                  <SelectTrigger id="model">
                    {isLoadingModels ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Загрузка моделей...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Выберите модель" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                        {model.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            - {model.description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Стиль изложения</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Выберите стиль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Профессиональный</SelectItem>
                    <SelectItem value="academic">Академический</SelectItem>
                    <SelectItem value="conversational">Разговорный</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="focus">Фокус курса</Label>
                <Select value={focus} onValueChange={setFocus}>
                  <SelectTrigger id="focus">
                    <SelectValue placeholder="Выберите фокус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Сбалансированный</SelectItem>
                    <SelectItem value="theory">Теоретический</SelectItem>
                    <SelectItem value="practice">Практический</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Креативность (температура: {temperature})</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Точный</span>
                <Input
                  id="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm">Креативный</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Успех</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Генерация курса...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Сгенерировать курс
            </>
          )}
        </Button>

        {generatedData && (
          <div className="flex flex-col space-y-2 w-full">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  onGeneratedContent(generatedData)
                  // Вызываем функцию предпросмотра, если она предоставлена
                  if (onPreview) {
                    onPreview()
                  }
                }}
                className="flex-1 mr-2"
              >
                <Eye className="mr-2 h-4 w-4" />
                Предпросмотр
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  onGeneratedContent(generatedData)
                  // Автоматически переключаемся на вкладку ввода данных
                  document.getElementById('input-tab')?.click()
                }}
                className="flex-1 ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Code className="mr-2 h-4 w-4" />
                Создать курс
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Нажмите &quot;Создать курс&quot;, чтобы перейти к созданию курса в CMS
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

export default AIGenerator
