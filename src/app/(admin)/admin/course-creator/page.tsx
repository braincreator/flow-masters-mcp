'use client'

import React, { useState } from 'react'
import '@/app/globals.css'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
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
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Download,
  Upload,
  Sparkles,
  File,
  Settings,
  Book,
  Code,
  FileJson,
  ArrowLeft,
  LayoutDashboard,
  HelpCircle,
  Info,
} from 'lucide-react'
import CoursePreview from '@/components/admin/CoursePreview'
import FileUpload from '@/components/admin/FileUpload'
import AIGenerator from '@/components/admin/AIGenerator'
import TemplateSelector from '@/components/admin/TemplateSelector'

interface CourseOptions {
  includeLanding: boolean
  includeFunnel: boolean
  language: string
  provider: 'openai' | 'google' | 'deepseek'
  model: 'gpt-4-turbo' | 'gpt-4o' | 'gpt-3.5-turbo' | 'gemini-pro' | 'deepseek-chat'
  apiKey?: string
}

export default function CourseCreatorPage() {
  const [activeTab, setActiveTab] = useState('input')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [courseData, setCourseData] = useState('')
  const [result, setResult] = useState<Record<string, any> | null>(null)
  const [previewData, setPreviewData] = useState<Record<string, any> | null>(null)
  const [options, setOptions] = useState<CourseOptions>({
    includeLanding: true,
    includeFunnel: true,
    language: 'ru',
    provider: 'openai',
    model: 'gpt-4-turbo',
    apiKey: process.env.OPENAI_API_KEY || '',
  })

  const handleCreateCourse = async () => {
    try {
      setLoading(true)
      setProgress(0)
      setError(null)
      setSuccess(null)
      setResult(null)

      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 500)

      // Парсим JSON данные курса
      let parsedData
      try {
        parsedData = JSON.parse(courseData)
      } catch (_e) {
        throw new Error('Неверный формат JSON. Пожалуйста, проверьте данные курса.')
      }

      // Проверяем структуру данных и корректируем при необходимости
      let requestData = {}

      // Если данные уже содержат поле course, используем их как есть
      if (parsedData.course) {
        requestData = {
          ...parsedData,
          language: options.language,
        }
      } else {
        // Иначе предполагаем, что весь объект - это данные курса
        requestData = {
          course: parsedData,
          language: options.language,
        }
      }

      // Если не включать лендинг или воронку, удаляем их из запроса
      if (!options.includeLanding && requestData.landing) {
        delete requestData.landing
      }

      if (!options.includeFunnel && requestData.funnel) {
        delete requestData.funnel
      }

      // Отправляем запрос на создание курса
      const response = await fetch('/api/v1/courses/create-from-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при создании курса')
      }

      // Complete progress
      setProgress(100)
      setResult(result.data)
      setSuccess('Курс успешно создан!')
      setActiveTab('result')
    } catch (error) {
      console.error('Error creating course:', error)
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500) // Small delay to ensure progress animation completes
    }
  }

  const handleFileLoaded = (content: string) => {
    try {
      setCourseData(content)
      setError(null)
      setSuccess('JSON-файл успешно загружен')
    } catch (_error) {
      setError('Ошибка при обработке файла')
    }
  }

  const handleExportCourse = () => {
    if (!result) return

    // Создаем файл для скачивания
    const dataStr = JSON.stringify(result, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    // Создаем имя файла на основе названия курса
    const courseTitle = result.course?.title || 'course'
    const fileName = `${courseTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`

    // Создаем ссылку для скачивания
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
  }

  const handlePreview = () => {
    try {
      // Парсим JSON данные курса
      let parsedData
      try {
        parsedData = JSON.parse(courseData)
      } catch (_e) {
        throw new Error('Неверный формат JSON. Пожалуйста, проверьте данные курса.')
      }

      // Проверяем структуру данных и корректируем при необходимости
      let previewData

      // Если данные уже содержат поле course, используем их как есть
      if (parsedData.course) {
        previewData = { ...parsedData }
      } else {
        // Иначе предполагаем, что весь объект - это данные курса
        previewData = { course: parsedData }
      }

      // Если не включать лендинг или воронку, удаляем их из предпросмотра
      if (!options.includeLanding && previewData.landing) {
        delete previewData.landing
      }

      if (!options.includeFunnel && previewData.funnel) {
        delete previewData.funnel
      }

      setPreviewData(previewData)
      setActiveTab('preview')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    }
  }

  const handleLoadSample = () => {
    const sampleData = {
      course: {
        title: 'Основы искусственного интеллекта',
        excerpt: 'Введение в мир ИИ: от базовых концепций до практического применения',
        description:
          'Этот курс познакомит вас с основами искусственного интеллекта, машинного обучения и нейронных сетей. Вы изучите ключевые концепции и алгоритмы, а также научитесь применять их на практике.',
        difficulty: 'beginner',
        estimatedDuration: '4 недели',
        learningOutcomes: [
          'Понимание основных концепций искусственного интеллекта',
          'Знание ключевых алгоритмов машинного обучения',
          'Умение работать с нейронными сетями',
          'Навыки применения ИИ для решения практических задач',
          'Понимание этических аспектов использования ИИ',
        ],
        targetAudience: [
          'Начинающие разработчики',
          'Студенты технических специальностей',
          'Специалисты, желающие расширить свои знания в области ИИ',
        ],
        modules: [
          {
            title: 'Введение в искусственный интеллект',
            description: 'Знакомство с основными концепциями и историей развития ИИ',
            lessons: [
              {
                title: 'Что такое искусственный интеллект',
                description: 'Определение ИИ, основные направления и подходы',
                duration: '30 минут',
                type: 'video',
              },
              {
                title: 'История развития ИИ',
                description: 'Ключевые этапы и достижения в области искусственного интеллекта',
                duration: '45 минут',
                type: 'video',
              },
              {
                title: 'Современное состояние и перспективы',
                description: 'Текущие достижения и будущие направления развития ИИ',
                duration: '40 минут',
                type: 'video',
              },
            ],
          },
          {
            title: 'Основы машинного обучения',
            description: 'Изучение базовых алгоритмов и подходов машинного обучения',
            lessons: [
              {
                title: 'Введение в машинное обучение',
                description: 'Основные понятия, типы задач и методы машинного обучения',
                duration: '50 минут',
                type: 'video',
              },
              {
                title: 'Обучение с учителем',
                description: 'Алгоритмы классификации и регрессии',
                duration: '60 минут',
                type: 'video',
              },
              {
                title: 'Обучение без учителя',
                description: 'Кластеризация и снижение размерности',
                duration: '55 минут',
                type: 'video',
              },
              {
                title: 'Практическое задание',
                description: 'Решение задачи классификации с использованием scikit-learn',
                duration: '90 минут',
                type: 'assignment',
              },
            ],
          },
          {
            title: 'Нейронные сети',
            description: 'Изучение архитектуры и принципов работы нейронных сетей',
            lessons: [
              {
                title: 'Введение в нейронные сети',
                description: 'Биологические нейроны и их искусственные аналоги',
                duration: '40 минут',
                type: 'video',
              },
              {
                title: 'Многослойные персептроны',
                description: 'Архитектура, обучение и применение MLP',
                duration: '60 минут',
                type: 'video',
              },
              {
                title: 'Сверточные нейронные сети',
                description: 'Архитектура и применение CNN для обработки изображений',
                duration: '70 минут',
                type: 'video',
              },
              {
                title: 'Рекуррентные нейронные сети',
                description: 'Архитектура и применение RNN для обработки последовательностей',
                duration: '65 минут',
                type: 'video',
              },
              {
                title: 'Практическое задание',
                description:
                  'Создание и обучение простой нейронной сети с использованием TensorFlow',
                duration: '120 минут',
                type: 'assignment',
              },
            ],
          },
        ],
      },
      landing: {
        hero: {
          heading: 'Основы искусственного интеллекта',
          subheading: 'Погрузитесь в мир ИИ и машинного обучения с нуля',
          ctaText: 'Записаться на курс',
        },
        sections: [
          {
            type: 'features',
            content: {
              heading: 'Что вы получите',
              features: [
                {
                  title: 'Фундаментальные знания',
                  description:
                    'Освоите базовые концепции и принципы работы искусственного интеллекта',
                  icon: 'brain',
                },
                {
                  title: 'Практические навыки',
                  description:
                    'Научитесь применять алгоритмы машинного обучения для решения реальных задач',
                  icon: 'code',
                },
                {
                  title: 'Современные технологии',
                  description:
                    'Познакомитесь с актуальными инструментами и фреймворками для работы с ИИ',
                  icon: 'settings',
                },
                {
                  title: 'Сертификат',
                  description: 'Получите документ, подтверждающий ваши знания и навыки',
                  icon: 'certificate',
                },
              ],
            },
          },
        ],
      },
      funnel: {
        emailSequence: [
          {
            subject: 'Добро пожаловать на курс "Основы искусственного интеллекта"!',
            content:
              'Здравствуйте! Мы рады приветствовать вас на нашем курсе. В ближайшее время вы получите доступ к материалам и сможете начать обучение.',
            delay: 0,
            triggerEvent: 'signup',
          },
          {
            subject: 'Ваш доступ к курсу активирован',
            content:
              'Доступ к курсу "Основы искусственного интеллекта" открыт! Вы можете приступить к изучению материалов прямо сейчас.',
            delay: 1,
            triggerEvent: 'signup',
          },
          {
            subject: 'Как идет обучение?',
            content:
              'Надеемся, вам нравится наш курс! Если у вас возникли вопросы или трудности, не стесняйтесь обращаться к нам за помощью.',
            delay: 7,
            triggerEvent: 'signup',
          },
        ],
        steps: [
          {
            name: 'Посещение лендинга',
            id: 'visit_landing',
            triggerType: 'pageview',
          },
          {
            name: 'Регистрация на курс',
            id: 'signup',
            triggerType: 'form_submit',
          },
          {
            name: 'Начало обучения',
            id: 'start_learning',
            triggerType: 'course_access',
          },
        ],
      },
    }

    setCourseData(JSON.stringify(sampleData, null, 2))
  }

  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-50">
          {/* Apply standard container styling */}
          <div className="container mx-auto px-4 py-4">
            {/* Add padding to inner content */}
            <div className="py-6">
              <Card className="mb-6 border-none shadow-md bg-gradient-to-r from-purple-500 to-pink-600">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-bold text-white">Создание курса</h1>
                      <p className="text-purple-100 mt-1">
                        Создавайте образовательный контент из внешних источников
                      </p>
                    </div>
                    <Button variant="secondary" asChild className="shadow-sm">
                      <Link href="/admin/course-creator/docs" className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        API документация
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6 p-1 bg-gray-100 shadow-sm rounded-lg">
                  <TabsTrigger
                    id="input-tab"
                    value="input"
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-700"
                  >
                    <FileJson className="h-4 w-4" />
                    <span>Ввод данных</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="templates"
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-700"
                  >
                    <File className="h-4 w-4" />
                    <span>Шаблоны</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="ai-generator"
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>AI Генератор</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    disabled={!previewData}
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Предпросмотр</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="result"
                    disabled={!result}
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-700"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Результат</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="templates">
                  <Card className="shadow-lg border-none">
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <File className="h-5 w-5 text-blue-600" />
                        Шаблоны курсов
                      </CardTitle>
                      <CardDescription>
                        Выберите готовый шаблон для быстрого создания курса
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <TemplateSelector onSelectTemplate={setCourseData} />
                    </CardContent>
                    <CardFooter className="bg-slate-50 flex justify-between py-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('input')}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Назад
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-generator">
                  <Card className="shadow-lg border-none">
                    {/* Consistent CardHeader background */}
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        AI Генератор
                      </CardTitle>
                      <CardDescription>
                        Создайте курс с помощью искусственного интеллекта
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <AIGenerator onGeneratedContent={setCourseData} />
                    </CardContent>
                    {/* Consistent CardFooter background */}
                    <CardFooter className="bg-gray-50 flex justify-between py-4 rounded-b-lg">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('input')}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Назад
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="input">
                  <Card className="shadow-lg border-none">
                    {/* Consistent CardHeader background */}
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <FileJson className="h-5 w-5 text-blue-600" />
                        Данные курса
                      </CardTitle>
                      <CardDescription>
                        Введите JSON-данные курса или загрузите готовый пример
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
                          <FileUpload onFileLoaded={handleFileLoaded} />

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={handleLoadSample}
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Загрузить пример
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={handlePreview}
                              disabled={!courseData}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Предпросмотр
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute top-0 right-0 px-2 py-1 text-xs font-mono text-slate-500 bg-slate-100 rounded-bl rounded-tr">
                          JSON
                        </div>
                        <Textarea
                          placeholder="Введите JSON-данные курса..."
                          className="min-h-[400px] font-mono bg-slate-50 border-slate-200 leading-relaxed"
                          value={courseData}
                          onChange={(e) => setCourseData(e.target.value)}
                        />
                      </div>

                      <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-4 w-4 text-blue-600" />
                            Настройки генерации
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="provider" className="text-blue-700">
                                AI Провайдер
                              </Label>
                              <Select
                                value={options.provider}
                                onValueChange={(value) =>
                                  setOptions({
                                    ...options,
                                    provider: value as CourseOptions['provider'],
                                  })
                                }
                              >
                                <SelectTrigger id="provider" className="bg-white">
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
                              <Label htmlFor="apiKey" className="text-blue-700">
                                API Ключ
                              </Label>
                              <Input
                                id="apiKey"
                                type="password"
                                value={options.apiKey || ''}
                                onChange={(e) => setOptions({ ...options, apiKey: e.target.value })}
                                placeholder="Введите API ключ"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="model" className="text-blue-700">
                                AI Модель
                              </Label>
                              <Select
                                value={options.model}
                                onValueChange={(value) =>
                                  setOptions({ ...options, model: value as CourseOptions['model'] })
                                }
                              >
                                <SelectTrigger id="model" className="bg-white">
                                  <SelectValue placeholder="Выберите модель" />
                                </SelectTrigger>
                                <SelectContent>
                                  {options.provider === 'google' ? (
                                    <>
                                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                    </>
                                  ) : options.provider === 'deepseek' ? (
                                    <>
                                      <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
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
                              <Label htmlFor="language" className="text-blue-700">
                                Язык
                              </Label>
                              <Select
                                value={options.language}
                                onValueChange={(value) =>
                                  setOptions({ ...options, language: value })
                                }
                              >
                                <SelectTrigger
                                  id="language"
                                  className="bg-gradient-to-r from-purple-500/80 to-pink-600/80 text-white hover:from-purple-500 hover:to-pink-600 border-transparent"
                                >
                                  <SelectValue placeholder="Выберите язык" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/80 backdrop-blur-sm">
                                  <SelectItem value="ru">Русский</SelectItem>
                                  <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="includeLanding"
                                checked={options.includeLanding}
                                onCheckedChange={(checked) =>
                                  setOptions({ ...options, includeLanding: checked as boolean })
                                }
                                className="border-blue-400 text-blue-600"
                              />
                              <Label htmlFor="includeLanding" className="text-blue-700">
                                Создать лендинг
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="includeFunnel"
                                checked={options.includeFunnel}
                                onCheckedChange={(checked) =>
                                  setOptions({ ...options, includeFunnel: checked as boolean })
                                }
                                className="border-blue-400 text-blue-600"
                              />
                              <Label htmlFor="includeFunnel" className="text-blue-700">
                                Создать воронку
                              </Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {error && (
                        <Alert variant="destructive" className="border-red-300 shadow-sm">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Ошибка</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="bg-green-50 border-green-200 shadow-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">Успех</AlertTitle>
                          <AlertDescription className="text-green-700">{success}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                    {/* Consistent CardFooter background */}
                    <CardFooter className="bg-gray-50 py-4 rounded-b-lg">
                      {loading && (
                        <div className="w-full mb-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Создание курса...</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                      <div className="w-full flex items-center gap-2">
                        <Button
                          onClick={handleCreateCourse}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Создание курса...
                            </>
                          ) : (
                            <>
                              <Code className="mr-2 h-5 w-5" />
                              Создать курс
                            </>
                          )}
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon">
                                <HelpCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>
                                Создание курса может занять некоторое время. Система создаст все
                                необходимые объекты: курс, модули, уроки, лендинг и воронку.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="preview">
                  <Card className="shadow-lg border-none">
                    {/* Consistent CardHeader background */}
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        Предпросмотр курса
                      </CardTitle>
                      <CardDescription>Просмотр курса перед созданием</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {previewData ? (
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <CoursePreview courseData={previewData} />
                        </div>
                      ) : (
                        <div className="text-center py-10 text-muted-foreground">
                          Нет данных для предпросмотра
                        </div>
                      )}
                    </CardContent>
                    {/* Consistent CardFooter background */}
                    <CardFooter className="bg-gray-50 flex flex-col py-4 rounded-b-lg">
                      {loading && (
                        <div className="w-full mb-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Создание курса...</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                      <div className="flex justify-between w-full">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('input')}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Вернуться к вводу данных
                        </Button>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>
                                  После создания курса вы сможете редактировать его в
                                  административной панели.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button
                            onClick={handleCreateCourse}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Создание курса...
                              </>
                            ) : (
                              <>
                                <Code className="mr-2 h-4 w-4" />
                                Создать курс
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="result">
                  <Card className="shadow-lg border-none">
                    {/* Consistent CardHeader background */}
                    <CardHeader className="bg-gray-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-blue-600" />
                        Результат создания курса
                      </CardTitle>
                      <CardDescription>
                        Информация о созданном курсе и связанных объектах
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {result && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                              <Book className="h-4 w-4 text-blue-600" />
                              Курс
                            </h3>
                            <pre className="bg-slate-50 p-4 rounded-md overflow-auto max-h-60 text-sm border border-slate-200 font-mono">
                              {JSON.stringify(result.course, null, 2)}
                            </pre>
                          </div>

                          <div>
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                              <Code className="h-4 w-4 text-blue-600" />
                              Модули
                            </h3>
                            <pre className="bg-slate-50 p-4 rounded-md overflow-auto max-h-60 text-sm border border-slate-200 font-mono">
                              {JSON.stringify(result.modules, null, 2)}
                            </pre>
                          </div>

                          {result.landing && (
                            <div>
                              <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                                <LayoutDashboard className="h-4 w-4 text-blue-600" />
                                Лендинг
                              </h3>
                              <pre className="bg-slate-50 p-4 rounded-md overflow-auto max-h-60 text-sm border border-slate-200 font-mono">
                                {JSON.stringify(result.landing, null, 2)}
                              </pre>
                            </div>
                          )}

                          {result.funnel && (
                            <div>
                              <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                                <Settings className="h-4 w-4 text-blue-600" />
                                Воронка
                              </h3>
                              <pre className="bg-slate-50 p-4 rounded-md overflow-auto max-h-60 text-sm border border-slate-200 font-mono">
                                {JSON.stringify(result.funnel, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    {/* Consistent CardFooter background */}
                    <CardFooter className="bg-gray-50 flex justify-between py-4 rounded-b-lg">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('input')}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Вернуться к вводу данных
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleExportCourse}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Экспортировать JSON
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>{' '}
            {/* Close inner padding div */}
          </div>{' '}
          {/* Close container div */}
        </div>
      </body>
    </html>
  )
}
