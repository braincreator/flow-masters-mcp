'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, File } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Template {
  id: string
  name: string
  description?: string
  type: 'course' | 'landing' | 'funnel' | 'full'
  content: any
  thumbnail?: {
    url: string
  }
  tags?: { tag: string }[]
}

interface TemplateSelectorProps {
  onSelectTemplate: (content: string) => void
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeTab, setActiveTab] = useState('course')
  
  useEffect(() => {
    fetchTemplates()
  }, [])
  
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/v1/templates?isPublic=true')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при загрузке шаблонов')
      }
      
      setTemplates(result.data)
    } catch (error) {
      logError('Error fetching templates:', error)
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSelectTemplate = (template: Template) => {
    try {
      // Преобразуем шаблон в строку JSON
      const jsonString = JSON.stringify(template.content, null, 2)
      
      // Передаем результат родительскому компоненту
      onSelectTemplate(jsonString)
    } catch (error) {
      logError('Error selecting template:', error)
      setError('Ошибка при выборе шаблона')
    }
  }
  
  const getTemplatesByType = (type: string) => {
    if (type === 'all') {
      return templates
    }
    return templates.filter(template => template.type === type)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Шаблоны курсов</CardTitle>
        <CardDescription>Выберите шаблон для быстрого создания курса</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : templates.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Шаблоны не найдены
          </div>
        ) : (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="course">Курсы</TabsTrigger>
              <TabsTrigger value="landing">Лендинги</TabsTrigger>
              <TabsTrigger value="funnel">Воронки</TabsTrigger>
              <TabsTrigger value="full">Комплекты</TabsTrigger>
            </TabsList>
      
            <div className="h-[400px] pr-4 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getTemplatesByType(activeTab).map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    {template.thumbnail && (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={template.thumbnail.url} 
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">{getTemplateTypeName(template.type)}</Badge>
                      </div>
                      {template.description && (
                        <CardDescription className="mt-2">{template.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {template.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag.tag}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleSelectTemplate(template)}
                        className="ml-auto"
                      >
                        <File className="mr-2 h-4 w-4" />
                        Выбрать
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

// Вспомогательная функция для получения названия типа шаблона
function getTemplateTypeName(type: string): string {
  switch (type) {
    case 'course':
      return 'Курс'
    case 'landing':
      return 'Лендинг'
    case 'funnel':
      return 'Воронка'
    case 'full':
      return 'Комплект'
    default:
      return type
  }
}

export default TemplateSelector
