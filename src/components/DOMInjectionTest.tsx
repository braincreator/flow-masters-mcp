'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Code,
  Eye,
  Zap
} from 'lucide-react'

interface DOMTestResult {
  scriptTags: {
    total: number
    yandexMetrika: number
    vkPixel: number
    googleAnalytics: number
    custom: number
  }
  analyticsObjects: {
    yandexMetrika: boolean
    vkPixel: boolean
    googleAnalytics: boolean
  }
  scriptSources: string[]
  errors: string[]
  recommendations: string[]
}

export function DOMInjectionTest() {
  const [result, setResult] = useState<DOMTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const runTest = () => {
    setIsLoading(true)
    
    // Небольшая задержка для завершения загрузки скриптов
    setTimeout(() => {
      try {
        const scriptTags = document.querySelectorAll('script')
        const scriptSources: string[] = []
        
        let yandexMetrikaScripts = 0
        let vkPixelScripts = 0
        let googleAnalyticsScripts = 0
        let customScripts = 0

        scriptTags.forEach((script) => {
          const src = script.src || 'inline'
          scriptSources.push(src)
          
          // Подсчитываем скрипты по типам
          if (src.includes('metrika') || src.includes('mc.yandex') || src.includes('mc.webvisor') || 
              script.innerHTML.includes('ym(') || script.id?.includes('yandex')) {
            yandexMetrikaScripts++
          } else if (src.includes('vk.com') || src.includes('vk-pixel') || src.includes('vk-ads') ||
                     script.innerHTML.includes('VK.') || script.id?.includes('vk')) {
            vkPixelScripts++
          } else if (src.includes('google') || src.includes('gtag') || src.includes('analytics') ||
                     script.innerHTML.includes('gtag(') || script.id?.includes('ga')) {
            googleAnalyticsScripts++
          } else if (script.innerHTML.includes('pixel') || script.innerHTML.includes('analytics')) {
            customScripts++
          }
        })

        // Проверяем наличие аналитических объектов
        const analyticsObjects = {
          yandexMetrika: typeof (window as any).ym === 'function',
          vkPixel: typeof (window as any).VK === 'object' && !!(window as any).VK?.Retargeting,
          googleAnalytics: typeof (window as any).gtag === 'function'
        }

        const errors: string[] = []
        const recommendations: string[] = []

        // Анализируем проблемы
        if (yandexMetrikaScripts === 0) {
          errors.push('Yandex Metrika scripts not found in DOM')
          recommendations.push('Check if NEXT_PUBLIC_YANDEX_METRIKA_ID is set and PixelManager is rendering')
        }

        if (vkPixelScripts === 0) {
          errors.push('VK Pixel scripts not found in DOM')
          recommendations.push('Check if NEXT_PUBLIC_VK_PIXEL_ID is set and VK pixel is configured')
        }

        if (yandexMetrikaScripts > 0 && !analyticsObjects.yandexMetrika) {
          errors.push('Yandex Metrika script injected but window.ym not available')
          recommendations.push('Check script loading errors or proxy issues')
        }

        if (vkPixelScripts > 0 && !analyticsObjects.vkPixel) {
          errors.push('VK Pixel script injected but window.VK not available')
          recommendations.push('Check VK script loading or proxy configuration')
        }

        if (scriptTags.length === 0) {
          errors.push('No script tags found in DOM at all')
          recommendations.push('Check if JavaScript is enabled and page is fully loaded')
        }

        if (errors.length === 0) {
          recommendations.push('🎉 All analytics scripts are properly injected into DOM!')
        }

        setResult({
          scriptTags: {
            total: scriptTags.length,
            yandexMetrika: yandexMetrikaScripts,
            vkPixel: vkPixelScripts,
            googleAnalytics: googleAnalyticsScripts,
            custom: customScripts
          },
          analyticsObjects,
          scriptSources: scriptSources.slice(0, 20), // Показываем первые 20
          errors,
          recommendations
        })

        setLastUpdate(new Date().toLocaleString())
      } catch (error) {
        console.error('DOM injection test failed:', error)
      } finally {
        setIsLoading(false)
      }
    }, 2000) // Ждем 2 секунды для загрузки скриптов
  }

  useEffect(() => {
    runTest()
    // Повторяем тест каждые 10 секунд
    const interval = setInterval(runTest, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (isGood: boolean) => {
    return isGood ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (count: number, expected: boolean = true) => {
    const isGood = expected ? count > 0 : count === 0
    return isGood ? (
      <Badge className="bg-green-500">{count}</Badge>
    ) : (
      <Badge variant="destructive">{count}</Badge>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Анализ DOM injection...
        </CardContent>
      </Card>
    )
  }

  const hasErrors = result.errors.length > 0
  const totalAnalyticsScripts = result.scriptTags.yandexMetrika + result.scriptTags.vkPixel + result.scriptTags.googleAnalytics

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Тест внедрения скриптов в DOM
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Проверка того, что аналитические скрипты действительно добавляются в DOM
            </p>
            <Button 
              onClick={runTest} 
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить тест
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Status */}
          <Alert className={hasErrors ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            {hasErrors ? (
              <XCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription>
              <strong>Статус DOM injection: </strong>
              {hasErrors ? (
                <span className="text-red-700">❌ Обнаружены проблемы с внедрением скриптов</span>
              ) : (
                <span className="text-green-700">✅ Скрипты успешно внедрены в DOM</span>
              )}
            </AlertDescription>
          </Alert>

          {/* Script Tags Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Статистика script тегов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{result.scriptTags.total}</div>
                  <div className="text-sm text-muted-foreground">Всего скриптов</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.scriptTags.yandexMetrika}</div>
                  <div className="text-sm text-muted-foreground">Yandex Metrika</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{result.scriptTags.vkPixel}</div>
                  <div className="text-sm text-muted-foreground">VK Pixel</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.scriptTags.googleAnalytics}</div>
                  <div className="text-sm text-muted-foreground">Google Analytics</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{result.scriptTags.custom}</div>
                  <div className="text-sm text-muted-foreground">Другие</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Objects Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Статус аналитических объектов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.analyticsObjects.yandexMetrika)}
                  <div>
                    <div className="font-medium">window.ym</div>
                    <div className="text-sm text-muted-foreground">
                      {result.analyticsObjects.yandexMetrika ? 'Доступен' : 'Недоступен'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.analyticsObjects.vkPixel)}
                  <div>
                    <div className="font-medium">window.VK</div>
                    <div className="text-sm text-muted-foreground">
                      {result.analyticsObjects.vkPixel ? 'Доступен' : 'Недоступен'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.analyticsObjects.googleAnalytics)}
                  <div>
                    <div className="font-medium">window.gtag</div>
                    <div className="text-sm text-muted-foreground">
                      {result.analyticsObjects.googleAnalytics ? 'Доступен' : 'Недоступен'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Script Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Источники скриптов (первые 20)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.scriptSources.map((src, index) => (
                  <div key={index} className="text-xs font-mono p-2 bg-muted rounded border">
                    {src === 'inline' ? (
                      <span className="text-blue-600">📝 Inline script</span>
                    ) : src.startsWith('/') ? (
                      <span className="text-green-600">🔗 {src} (proxy)</span>
                    ) : src.startsWith('http') ? (
                      <span className="text-orange-600">🌐 {src} (external)</span>
                    ) : (
                      <span className="text-gray-600">{src}</span>
                    )}
                  </div>
                ))}
                {result.scriptSources.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Скрипты не найдены
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {result.errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong className="text-red-800">Обнаруженные проблемы:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Recommendations */}
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <strong>Рекомендации:</strong>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold">{totalAnalyticsScripts}</div>
              <div className="text-sm text-muted-foreground">Аналитических скриптов</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{Object.values(result.analyticsObjects).filter(Boolean).length}</div>
              <div className="text-sm text-muted-foreground">Объектов доступно</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{result.errors.length}</div>
              <div className="text-sm text-muted-foreground">Ошибок</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {Math.round((Object.values(result.analyticsObjects).filter(Boolean).length / 3) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Успешность</div>
            </div>
          </div>

          {/* Last Update */}
          {lastUpdate && (
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              Последнее обновление: {lastUpdate}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
