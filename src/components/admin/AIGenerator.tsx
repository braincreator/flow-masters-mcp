'use client'

import React, { useState } from 'react'
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
import { Loader2, AlertCircle, CheckCircle2, Sparkles, Eye, Code } from 'lucide-react'

interface AIGeneratorProps {
  onGeneratedContent: (content: string) => void
}

export function AIGenerator({ onGeneratedContent }: AIGeneratorProps) {
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
  const [provider, setProvider] = useState<'openai' | 'google' | 'deepseek'>('openai')
  const [model, setModel] = useState<string>('gpt-4-turbo')
  const [apiKey, setApiKey] = useState<string>('')
  const [apiKeySource, setApiKeySource] = useState<'manual' | 'env'>('env')
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
      setError('Пожалуйста, укажите API ключ или выберите использование переменных окружения')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

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
          provider,
          model,
          apiKey: apiKeySource === 'env' ? undefined : apiKey,
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
                  value={provider}
                  onValueChange={(value) => {
                    setProvider(value as 'openai' | 'google' | 'deepseek')
                    // Reset to default model when provider changes
                    if (value === 'google') setModel('gemini-pro')
                    else if (value === 'deepseek') setModel('deepseek-chat')
                    else setModel('gpt-4-turbo')
                  }}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Выберите провайдера" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="google">Google Gemini</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKeySource">Источник API ключа</Label>
                <Select
                  value={apiKeySource}
                  onValueChange={(value) => {
                    setApiKeySource(value as 'manual' | 'env')
                    setApiKey(
                      value === 'env'
                        ? provider === 'openai'
                          ? process.env.OPENAI_API_KEY || ''
                          : provider === 'google'
                            ? process.env.GOOGLE_API_KEY || ''
                            : process.env.DEEPSEEK_API_KEY || ''
                        : '',
                    )
                  }}
                >
                  <SelectTrigger id="apiKeySource">
                    <SelectValue placeholder="Выберите источник" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="env">Из переменных окружения</SelectItem>
                    <SelectItem value="manual">Ввести вручную</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {apiKeySource === 'manual' && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Ключ</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Введите API ключ"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="model">Модель AI</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    {provider === 'google' ? (
                      <>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                      </>
                    ) : provider === 'deepseek' ? (
                      <>
                        <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                        <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </>
                    )}
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
                onClick={() => onGeneratedContent(generatedData)}
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
