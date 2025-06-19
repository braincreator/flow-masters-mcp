'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react'

declare global {
  interface Window {
    ym: (id: number, action: string, ...args: any[]) => void
  }
}

export const YandexMetrikaTest: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [metrikaId, setMetrikaId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Array<{
    test: string
    status: 'success' | 'error' | 'pending'
    message: string
    timestamp: string
  }>>([])

  useEffect(() => {
    // Получаем ID Яндекс Метрики из переменной окружения
    const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
    setMetrikaId(id || null)

    // Проверяем загрузку Яндекс Метрики
    const checkMetrika = () => {
      if (typeof window.ym !== 'undefined') {
        setIsLoaded(true)
        addTestResult('Initialization', 'success', 'Yandex Metrika loaded successfully')
      } else {
        setIsLoaded(false)
        addTestResult('Initialization', 'error', 'Yandex Metrika not found')
      }
    }

    // Проверяем сразу и через интервалы
    checkMetrika()
    const interval = setInterval(checkMetrika, 1000)

    // Очищаем интервал через 10 секунд
    setTimeout(() => clearInterval(interval), 10000)

    return () => clearInterval(interval)
  }, [])

  const addTestResult = (test: string, status: 'success' | 'error' | 'pending', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testPageView = () => {
    if (!isLoaded || !metrikaId) {
      addTestResult('Page View', 'error', 'Yandex Metrika not loaded')
      return
    }

    try {
      window.ym(parseInt(metrikaId), 'hit', window.location.href)
      addTestResult('Page View', 'success', 'Page view sent successfully')
    } catch (error) {
      addTestResult('Page View', 'error', `Error: ${error}`)
    }
  }

  const testGoalEvent = () => {
    if (!isLoaded || !metrikaId) {
      addTestResult('Goal Event', 'error', 'Yandex Metrika not loaded')
      return
    }

    try {
      window.ym(parseInt(metrikaId), 'reachGoal', 'test_button_click')
      addTestResult('Goal Event', 'success', 'Goal "test_button_click" sent successfully')
    } catch (error) {
      addTestResult('Goal Event', 'error', `Error: ${error}`)
    }
  }

  const testCustomEvent = () => {
    if (!isLoaded || !metrikaId) {
      addTestResult('Custom Event', 'error', 'Yandex Metrika not loaded')
      return
    }

    try {
      window.ym(parseInt(metrikaId), 'reachGoal', 'custom_test_event', {
        test_parameter: 'test_value',
        timestamp: Date.now()
      })
      addTestResult('Custom Event', 'success', 'Custom event with parameters sent successfully')
    } catch (error) {
      addTestResult('Custom Event', 'error', `Error: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Yandex Metrika Test Panel
        </CardTitle>
        <CardDescription>
          Test and debug Yandex Metrika integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <Badge variant={isLoaded ? 'default' : 'destructive'}>
            {isLoaded ? 'Loaded' : 'Not Loaded'}
          </Badge>
          {metrikaId && (
            <Badge variant="outline">
              ID: {metrikaId}
            </Badge>
          )}
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={testPageView} disabled={!isLoaded} size="sm">
            Test Page View
          </Button>
          <Button onClick={testGoalEvent} disabled={!isLoaded} size="sm">
            Test Goal Event
          </Button>
          <Button onClick={testCustomEvent} disabled={!isLoaded} size="sm">
            Test Custom Event
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Test Results</h4>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear
            </Button>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-1">
            {testResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests run yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded text-sm">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.test}</span>
                      <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                    </div>
                    <p className="text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How to verify:</strong></p>
          <p>1. Open browser DevTools (F12) → Console tab</p>
          <p>2. Look for "Yandex Metrika" log messages</p>
          <p>3. Check Network tab for requests to mc.yandex.ru</p>
          <p>4. Visit your Yandex Metrika dashboard to see real-time data</p>
        </div>
      </CardContent>
    </Card>
  )
}
