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
  Zap,
  Copy,
  ExternalLink
} from 'lucide-react'

interface FixStatus {
  environmentVariables: {
    yandexMetrika: boolean
    vkPixel: boolean
    googleAnalytics: boolean
    forceMode: boolean
  }
  analyticsObjects: {
    yandexMetrika: boolean
    vkPixel: boolean
    googleAnalytics: boolean
  }
  proxyEndpoints: {
    metrika: boolean
    vkPixel: boolean
    vkAds: boolean
  }
  overallStatus: 'good' | 'partial' | 'poor'
  recommendations: string[]
}

export function AnalyticsFixStatus() {
  const [status, setStatus] = useState<FixStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const checkStatus = async () => {
    setIsLoading(true)
    try {
      // Проверяем переменные окружения
      const envVars = {
        yandexMetrika: !!process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
        vkPixel: !!process.env.NEXT_PUBLIC_VK_PIXEL_ID,
        googleAnalytics: !!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
        forceMode: process.env.NEXT_PUBLIC_FORCE_LOAD_PIXELS === 'true'
      }

      // Проверяем аналитические объекты
      const analyticsObjects = {
        yandexMetrika: typeof window !== 'undefined' && typeof (window as any).ym === 'function',
        vkPixel: typeof window !== 'undefined' && typeof (window as any).VK === 'object',
        googleAnalytics: typeof window !== 'undefined' && typeof (window as any).gtag === 'function'
      }

      // Проверяем proxy endpoints
      const proxyTests = await Promise.allSettled([
        fetch('/metrika/tag_ww.js', { method: 'HEAD' }),
        fetch('/vk-pixel/js/api/openapi.js', { method: 'HEAD' }),
        fetch('/vk-ads/', { method: 'HEAD' })
      ])

      const proxyEndpoints = {
        metrika: proxyTests[0].status === 'fulfilled' && (proxyTests[0].value as Response).ok,
        vkPixel: proxyTests[1].status === 'fulfilled' && (proxyTests[1].value as Response).ok,
        vkAds: proxyTests[2].status === 'fulfilled' && (proxyTests[2].value as Response).ok
      }

      // Определяем общий статус
      const envScore = Object.values(envVars).filter(Boolean).length
      const analyticsScore = Object.values(analyticsObjects).filter(Boolean).length
      const proxyScore = Object.values(proxyEndpoints).filter(Boolean).length
      
      const totalScore = envScore + analyticsScore + proxyScore
      const maxScore = 10 // 4 + 3 + 3

      let overallStatus: 'good' | 'partial' | 'poor'
      if (totalScore >= 8) overallStatus = 'good'
      else if (totalScore >= 5) overallStatus = 'partial'
      else overallStatus = 'poor'

      // Генерируем рекомендации
      const recommendations: string[] = []
      
      if (!envVars.yandexMetrika) recommendations.push('Добавить NEXT_PUBLIC_YANDEX_METRIKA_ID в .env.local')
      if (!envVars.vkPixel) recommendations.push('Добавить NEXT_PUBLIC_VK_PIXEL_ID в .env.local')
      if (!envVars.googleAnalytics) recommendations.push('Добавить NEXT_PUBLIC_GOOGLE_ANALYTICS_ID в .env.local')
      if (!envVars.forceMode) recommendations.push('Установить NEXT_PUBLIC_FORCE_LOAD_PIXELS=true для принудительной загрузки')
      
      if (!analyticsObjects.yandexMetrika) recommendations.push('Yandex Metrika не загружена - проверить скрипты')
      if (!analyticsObjects.vkPixel) recommendations.push('VK Pixel не загружен - проверить скрипты')
      if (!analyticsObjects.googleAnalytics) recommendations.push('Google Analytics не загружен - проверить скрипты')
      
      if (!proxyEndpoints.metrika) recommendations.push('Proxy для Yandex Metrika не работает')
      if (!proxyEndpoints.vkPixel) recommendations.push('Proxy для VK Pixel не работает')
      if (!proxyEndpoints.vkAds) recommendations.push('Proxy для VK Ads не работает')

      if (recommendations.length === 0) {
        recommendations.push('🎉 Все системы работают корректно!')
      }

      setStatus({
        environmentVariables: envVars,
        analyticsObjects,
        proxyEndpoints,
        overallStatus,
        recommendations
      })

      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to check status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
    // Проверяем каждые 30 секунд
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (isGood: boolean) => {
    return isGood ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (isGood: boolean) => {
    return isGood ? (
      <Badge className="bg-green-500">ОК</Badge>
    ) : (
      <Badge variant="destructive">Проблема</Badge>
    )
  }

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'partial': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const copyEnvVars = () => {
    const envContent = `# Analytics Configuration
NEXT_PUBLIC_YANDEX_METRIKA_ID=101007010
NEXT_PUBLIC_VK_PIXEL_ID=VK-RTRG-2138516-bKJJr
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Force load all pixels (for testing)
NEXT_PUBLIC_FORCE_LOAD_PIXELS=true`
    
    navigator.clipboard.writeText(envContent)
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Проверка статуса исправлений...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Статус исправлений аналитики
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Проверка исправления проблем, обнаруженных на странице диагностики
            </p>
            <Button 
              onClick={checkStatus} 
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Status */}
          <Alert className={getOverallStatusColor(status.overallStatus)}>
            {status.overallStatus === 'good' ? (
              <CheckCircle className="h-4 w-4" />
            ) : status.overallStatus === 'partial' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <strong>Общий статус: </strong>
              {status.overallStatus === 'good' && '🎉 Отлично! Все основные компоненты работают'}
              {status.overallStatus === 'partial' && '⚠️ Частично исправлено. Требуются дополнительные действия'}
              {status.overallStatus === 'poor' && '❌ Требуется исправление. Много проблем обнаружено'}
            </AlertDescription>
          </Alert>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Переменные окружения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Yandex Metrika ID</span>
                  {getStatusBadge(status.environmentVariables.yandexMetrika)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">VK Pixel ID</span>
                  {getStatusBadge(status.environmentVariables.vkPixel)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Google Analytics ID</span>
                  {getStatusBadge(status.environmentVariables.googleAnalytics)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Force Mode</span>
                  {getStatusBadge(status.environmentVariables.forceMode)}
                </div>
              </div>
              
              {(!status.environmentVariables.yandexMetrika || 
                !status.environmentVariables.vkPixel || 
                !status.environmentVariables.forceMode) && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Добавьте в .env.local:</span>
                    <Button size="sm" variant="outline" onClick={copyEnvVars}>
                      <Copy className="h-3 w-3 mr-1" />
                      Копировать
                    </Button>
                  </div>
                  <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`NEXT_PUBLIC_YANDEX_METRIKA_ID=101007010
NEXT_PUBLIC_VK_PIXEL_ID=VK-RTRG-2138516-bKJJr
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FORCE_LOAD_PIXELS=true`}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics Objects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Аналитические объекты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(status.analyticsObjects.yandexMetrika)}
                  <div>
                    <div className="font-medium">window.ym</div>
                    <div className="text-sm text-muted-foreground">
                      {status.analyticsObjects.yandexMetrika ? 'Загружен' : 'Не загружен'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(status.analyticsObjects.vkPixel)}
                  <div>
                    <div className="font-medium">window.VK</div>
                    <div className="text-sm text-muted-foreground">
                      {status.analyticsObjects.vkPixel ? 'Загружен' : 'Не загружен'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(status.analyticsObjects.googleAnalytics)}
                  <div>
                    <div className="font-medium">window.gtag</div>
                    <div className="text-sm text-muted-foreground">
                      {status.analyticsObjects.googleAnalytics ? 'Загружен' : 'Не загружен'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proxy Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proxy Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(status.proxyEndpoints.metrika)}
                  <div>
                    <div className="font-medium">/metrika/*</div>
                    <div className="text-sm text-muted-foreground">
                      {status.proxyEndpoints.metrika ? 'Работает' : 'Не работает'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(status.proxyEndpoints.vkPixel)}
                  <div>
                    <div className="font-medium">/vk-pixel/*</div>
                    <div className="text-sm text-muted-foreground">
                      {status.proxyEndpoints.vkPixel ? 'Работает' : 'Не работает'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(status.proxyEndpoints.vkAds)}
                  <div>
                    <div className="font-medium">/vk-ads/*</div>
                    <div className="text-sm text-muted-foreground">
                      {status.proxyEndpoints.vkAds ? 'Работает' : 'Не работает'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <strong>Рекомендации:</strong>
                <ul className="list-disc list-inside space-y-1">
                  {status.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => window.open('/en/test/analytics', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Открыть полную диагностику
            </Button>
            
            <Button 
              onClick={copyEnvVars}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Копировать .env настройки
            </Button>
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
