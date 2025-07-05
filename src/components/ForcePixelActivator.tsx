'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient } from '@/lib/httpClient'
import {
  Rocket,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react'

interface PixelStats {
  total: number
  active: number
  inactive: number
  gdprCompliant: number
  allPages: number
  highPriority: number
  forceMode: boolean
}

interface ForceActivationResult {
  success: boolean
  message?: string
  results?: {
    totalPixels: number
    activatedPixels: number
    alreadyActivePixels: number
    errors: string[]
    updatedPixels: any[]
  }
  instructions?: {
    environmentVariable: string
    restart: string
    verification: string
  }
  error?: string
}

export function ForcePixelActivator() {
  const [stats, setStats] = useState<PixelStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [activationResult, setActivationResult] = useState<ForceActivationResult | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.get('/api/pixels/force-activate')
      setStats(data.stats)
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to load pixel stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const activateAllPixels = async () => {
    setIsActivating(true)
    try {
      const result = await apiClient.post('/api/pixels/force-activate')
      setActivationResult(result)

      // Обновляем статистику после активации
      if (result.success) {
        await loadStats()
      }
    } catch (error) {
      setActivationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsActivating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    loadStats()
  }, [])

  const isFullyOptimized =
    stats &&
    stats.active === stats.total &&
    stats.gdprCompliant === 0 &&
    stats.allPages === stats.total &&
    stats.highPriority === stats.total &&
    stats.forceMode

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            🚀 Принудительная активация пикселей
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Включить ВСЕ пиксели независимо от настроек GDPR, согласий и ограничений
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Всего пикселей</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Активных</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">Неактивных</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.gdprCompliant}</div>
                <div className="text-sm text-muted-foreground">С GDPR</div>
              </div>
            </div>
          )}

          {/* Force Mode Status */}
          <Alert
            className={
              stats?.forceMode ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
            }
          >
            <Zap className={`h-4 w-4 ${stats?.forceMode ? 'text-green-600' : 'text-yellow-600'}`} />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>Принудительный режим: </strong>
                  {stats?.forceMode ? (
                    <span className="text-green-700">🚀 АКТИВЕН</span>
                  ) : (
                    <span className="text-yellow-700">❌ НЕ АКТИВЕН</span>
                  )}
                </div>
                {stats?.forceMode && <Badge className="bg-green-500">FORCE MODE ON</Badge>}
              </div>
            </AlertDescription>
          </Alert>

          {/* Optimization Status */}
          {isFullyOptimized ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>🎉 Полная оптимизация!</strong> Все пиксели настроены для принудительной
                загрузки и режим FORCE MODE активен. Все счетчики должны работать независимо от
                настроек.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Требуется оптимизация:</strong> Некоторые пиксели не настроены для
                принудительной загрузки. Нажмите кнопку ниже для автоматической настройки.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={activateAllPixels}
              disabled={isActivating}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Rocket className={`h-4 w-4 ${isActivating ? 'animate-spin' : ''}`} />
              {isActivating ? 'Активация...' : '🚀 АКТИВИРОВАТЬ ВСЕ ПИКСЕЛИ'}
            </Button>

            <Button
              onClick={loadStats}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить статистику
            </Button>

            <Button
              onClick={() => window.open('/en/test/analytics', '_blank')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Проверить работу
            </Button>
          </div>

          {/* Activation Result */}
          {activationResult && (
            <Card>
              <CardHeader>
                <CardTitle
                  className={`text-lg ${activationResult.success ? 'text-green-600' : 'text-red-600'}`}
                >
                  {activationResult.success ? '✅ Активация завершена' : '❌ Ошибка активации'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activationResult.success ? (
                  <div className="space-y-4">
                    <p className="text-green-700">{activationResult.message}</p>

                    {activationResult.results && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {activationResult.results.activatedPixels}
                          </div>
                          <div className="text-sm text-muted-foreground">Активировано</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {activationResult.results.alreadyActivePixels}
                          </div>
                          <div className="text-sm text-muted-foreground">Уже активных</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-xl font-bold text-red-600">
                            {activationResult.results.errors.length}
                          </div>
                          <div className="text-sm text-muted-foreground">Ошибок</div>
                        </div>
                      </div>
                    )}

                    {activationResult.instructions && (
                      <div className="space-y-3">
                        <h4 className="font-medium">📋 Следующие шаги:</h4>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <span className="text-sm flex-1">
                              1. {activationResult.instructions.environmentVariable}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard('NEXT_PUBLIC_FORCE_LOAD_PIXELS=true')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="p-3 bg-muted rounded-lg">
                            <span className="text-sm">
                              2. {activationResult.instructions.restart}
                            </span>
                          </div>

                          <div className="p-3 bg-muted rounded-lg">
                            <span className="text-sm">
                              3. {activationResult.instructions.verification}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activationResult.results?.errors &&
                      activationResult.results.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-600">Ошибки:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                            {activationResult.results.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-red-700">Ошибка: {activationResult.error}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Что делает принудительная активация?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Активирует все пиксели</strong> - устанавливает isActive: true
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Отключает GDPR ограничения</strong> - убирает gdprCompliant: false
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Устанавливает загрузку на всех страницах</strong> - pages: ['all']
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Устанавливает высокий приоритет</strong> - loadPriority: 'high'
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <strong>Требует переменную окружения</strong> -
                    NEXT_PUBLIC_FORCE_LOAD_PIXELS=true
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>⚠️ Внимание:</strong> Принудительный режим отключает все проверки согласий
              GDPR и загружает пиксели независимо от настроек пользователя. Используйте только для
              тестирования или в регионах, где GDPR не применяется.
            </AlertDescription>
          </Alert>

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
