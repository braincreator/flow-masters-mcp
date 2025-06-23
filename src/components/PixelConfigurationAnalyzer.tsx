'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Settings,
  Eye,
  Shield,
  Database,
  Flag,
  Cookie,
  Code
} from 'lucide-react'
import { useCookieConsent } from '@/hooks/useCookieConsent'

interface ConfigurationAnalysis {
  timestamp: string
  configurationIssues: Array<{
    category?: string
    pixelId?: string
    pixelName?: string
    pixelType?: string
    issues?: string[]
    issue?: string
    error?: string
  }>
  pixelSettings: {
    totalPixels: number
    activePixels: number
    inactivePixels: number
    gdprCompliantPixels: number
    pageSpecificPixels: number
  }
  consentSettings: {
    cookieConsentRequired: boolean
    gdprEnabled: boolean
    defaultConsentState: string
  }
  featureFlags: {
    analyticsEnabled: boolean
    debugMode: boolean
    developmentMode: boolean
  }
  environmentChecks: {
    nodeEnv: string
    analyticsIds: {
      yandexMetrika: boolean
      vkPixel: boolean
      googleAnalytics: boolean
    }
  }
  recommendations: string[]
}

export function PixelConfigurationAnalyzer() {
  const [analysis, setAnalysis] = useState<ConfigurationAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const { hasConsent, hasAnalytics, hasMarketing, detailedConsent } = useCookieConsent()

  const runAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test/pixel-configuration')
      const data = await response.json()
      setAnalysis(data)
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to run configuration analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runAnalysis()
  }, [])

  const getStatusIcon = (hasIssues: boolean) => {
    return hasIssues ? (
      <XCircle className="h-4 w-4 text-red-500" />
    ) : (
      <CheckCircle className="h-4 w-4 text-green-500" />
    )
  }

  const getStatusBadge = (hasIssues: boolean) => {
    return hasIssues ? (
      <Badge variant="destructive">Проблемы</Badge>
    ) : (
      <Badge className="bg-green-500">ОК</Badge>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Database':
        return <Database className="h-4 w-4" />
      case 'Environment Variables':
        return <Code className="h-4 w-4" />
      case 'Potential Blocking Scenarios':
        return <Shield className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Загрузка анализа конфигурации...
        </CardContent>
      </Card>
    )
  }

  const hasConfigurationIssues = analysis.configurationIssues.length > 0
  const hasInactivePixels = analysis.pixelSettings.inactivePixels > 0
  const hasGdprIssues = analysis.pixelSettings.gdprCompliantPixels > 0 && !hasAnalytics

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Анализ конфигурации пикселей
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Проверка настроек пикселей, согласий и потенциальных блокировок
            </p>
            <Button 
              onClick={runAnalysis} 
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Анализ...' : 'Обновить анализ'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Database className="h-5 w-5" />
                <span className="font-medium">Всего пикселей</span>
              </div>
              <div className="text-2xl font-bold">{analysis.pixelSettings.totalPixels}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Активных</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{analysis.pixelSettings.activePixels}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium">Неактивных</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{analysis.pixelSettings.inactivePixels}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium">GDPR</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{analysis.pixelSettings.gdprCompliantPixels}</div>
            </div>
          </div>

          {/* Current Consent Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cookie className="h-5 w-5" />
                Текущее состояние согласий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(!hasConsent)}
                  <span className="text-sm">Общее согласие: {hasConsent ? 'Дано' : 'Не дано'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!hasAnalytics)}
                  <span className="text-sm">Аналитика: {hasAnalytics ? 'Разрешена' : 'Запрещена'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!hasMarketing)}
                  <span className="text-sm">Маркетинг: {hasMarketing ? 'Разрешен' : 'Запрещен'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Состояние: {analysis.consentSettings.defaultConsentState}</span>
                </div>
              </div>
              
              {detailedConsent && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Детальные согласия:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <span>Необходимые: {detailedConsent.necessary ? '✅' : '❌'}</span>
                    <span>Аналитика: {detailedConsent.analytics ? '✅' : '❌'}</span>
                    <span>Маркетинг: {detailedConsent.marketing ? '✅' : '❌'}</span>
                    <span>Предпочтения: {detailedConsent.preferences ? '✅' : '❌'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment & Feature Flags */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flag className="h-5 w-5" />
                  Флаги функций
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Аналитика включена</span>
                    {getStatusBadge(!analysis.featureFlags.analyticsEnabled)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Режим отладки</span>
                    <Badge variant={analysis.featureFlags.debugMode ? "default" : "outline"}>
                      {analysis.featureFlags.debugMode ? 'Включен' : 'Выключен'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Среда разработки</span>
                    <Badge variant={analysis.featureFlags.developmentMode ? "default" : "outline"}>
                      {analysis.environmentChecks.nodeEnv}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5" />
                  ID аналитических сервисов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Yandex Metrika</span>
                    {getStatusBadge(!analysis.environmentChecks.analyticsIds.yandexMetrika)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">VK Pixel</span>
                    {getStatusBadge(!analysis.environmentChecks.analyticsIds.vkPixel)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Google Analytics</span>
                    {getStatusBadge(!analysis.environmentChecks.analyticsIds.googleAnalytics)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Issues */}
          {hasConfigurationIssues && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Проблемы конфигурации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.configurationIssues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getCategoryIcon(issue.category || 'Unknown')}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              {issue.category || issue.pixelName || 'Неизвестная проблема'}
                            </span>
                            {issue.pixelType && (
                              <Badge variant="outline">{issue.pixelType}</Badge>
                            )}
                          </div>
                          
                          {issue.issues && (
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {issue.issues.map((subIssue, subIndex) => (
                                <li key={subIndex}>{subIssue}</li>
                              ))}
                            </ul>
                          )}
                          
                          {issue.issue && (
                            <p className="text-sm text-muted-foreground">{issue.issue}</p>
                          )}
                          
                          {issue.error && (
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                              Ошибка: {issue.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Рекомендации:</strong>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Potential Blocking Scenarios */}
          {(hasGdprIssues || hasInactivePixels) && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong className="text-yellow-800">Потенциальные блокировки:</strong>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    {hasGdprIssues && (
                      <li>GDPR-совместимые пиксели заблокированы из-за отсутствия согласия на аналитику</li>
                    )}
                    {hasInactivePixels && (
                      <li>{analysis.pixelSettings.inactivePixels} пикселей отключены в админке</li>
                    )}
                    {analysis.pixelSettings.pageSpecificPixels > 0 && (
                      <li>{analysis.pixelSettings.pageSpecificPixels} пикселей настроены только для определенных страниц</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {!hasConfigurationIssues && analysis.pixelSettings.activePixels > 0 && hasAnalytics && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Конфигурация выглядит хорошо!</strong> У вас {analysis.pixelSettings.activePixels} активных пикселей 
                и согласие пользователя получено. Пиксели должны загружаться корректно.
              </AlertDescription>
            </Alert>
          )}

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
