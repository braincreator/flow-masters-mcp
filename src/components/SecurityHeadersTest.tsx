'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Globe,
  Lock,
  Eye
} from 'lucide-react'

interface SecurityTestResult {
  timestamp: string
  securityAnalysis: {
    csp: {
      present: boolean
      analyticsSupport: {
        yandexMetrika: boolean
        vkPixel: boolean
        vkAds: boolean
        googleAnalytics: boolean
      }
      issues: string[]
    }
    contentType: {
      present: boolean
      value: string
      impact: string
    }
    frameOptions: {
      present: boolean
      value: string
      impact: string
    }
    referrerPolicy: {
      present: boolean
      value: string
      impact: string
    }
  }
  recommendations: string[]
  scriptLoadingTests: Array<{
    name: string
    url: string
    status: number
    contentType: string
    success: boolean
    error?: string
  }>
  summary: {
    securityLevel: 'high' | 'medium' | 'low'
    analyticsCompatibility: 'good' | 'partial' | 'poor'
    criticalIssues: number
  }
}

export function SecurityHeadersTest() {
  const [testResults, setTestResults] = useState<SecurityTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const runTests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test/security-headers')
      const data = await response.json()
      setTestResults(data)
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to run security tests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getSecurityLevelBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-green-500">Высокий</Badge>
      case 'medium':
        return <Badge className="bg-yellow-500">Средний</Badge>
      case 'low':
        return <Badge variant="destructive">Низкий</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const getCompatibilityBadge = (compatibility: string) => {
    switch (compatibility) {
      case 'good':
        return <Badge className="bg-green-500">Хорошая</Badge>
      case 'partial':
        return <Badge className="bg-yellow-500">Частичная</Badge>
      case 'poor':
        return <Badge variant="destructive">Плохая</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Тест заголовков безопасности
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Проверка влияния заголовков безопасности на работу аналитики
            </p>
            <Button 
              onClick={runTests} 
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Тестирование...' : 'Запустить тест'}
            </Button>
          </div>
        </CardHeader>
        
        {testResults && (
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">Уровень безопасности</span>
                </div>
                {getSecurityLevelBadge(testResults.summary.securityLevel)}
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Совместимость с аналитикой</span>
                </div>
                {getCompatibilityBadge(testResults.summary.analyticsCompatibility)}
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Критические проблемы</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {testResults.summary.criticalIssues}
                </div>
              </div>
            </div>

            {/* CSP Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Security Policy (CSP)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {testResults.securityAnalysis.csp.present ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>CSP заголовок {testResults.securityAnalysis.csp.present ? 'присутствует' : 'отсутствует'}</span>
                  </div>

                  {testResults.securityAnalysis.csp.present && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Поддержка аналитических сервисов:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(testResults.securityAnalysis.csp.analyticsSupport).map(([service, supported]) => (
                          <div key={service} className="flex items-center gap-2">
                            {supported ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-sm capitalize">{service.replace(/([A-Z])/g, ' $1')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {testResults.securityAnalysis.csp.issues.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <strong>Обнаруженные проблемы:</strong>
                          <ul className="list-disc list-inside space-y-1">
                            {testResults.securityAnalysis.csp.issues.map((issue, index) => (
                              <li key={index} className="text-sm">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Other Security Headers */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">X-Content-Type-Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {testResults.securityAnalysis.contentType.present ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Значение: {testResults.securityAnalysis.contentType.value || 'Не установлено'}</span>
                    </div>
                    {testResults.securityAnalysis.contentType.impact && (
                      <p className="text-sm text-muted-foreground">
                        {testResults.securityAnalysis.contentType.impact}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">X-Frame-Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {testResults.securityAnalysis.frameOptions.present ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Значение: {testResults.securityAnalysis.frameOptions.value || 'Не установлено'}</span>
                    </div>
                    {testResults.securityAnalysis.frameOptions.impact && (
                      <p className="text-sm text-muted-foreground">
                        {testResults.securityAnalysis.frameOptions.impact}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Script Loading Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Тесты загрузки скриптов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.scriptLoadingTests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {test.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Status: {test.status} | Content-Type: {test.contentType}
                          </div>
                          {test.error && (
                            <div className="text-sm text-red-500">Error: {test.error}</div>
                          )}
                        </div>
                      </div>
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {testResults.recommendations.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <strong>Рекомендации:</strong>
                    <ul className="list-disc list-inside space-y-1">
                      {testResults.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
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
        )}
      </Card>
    </div>
  )
}
