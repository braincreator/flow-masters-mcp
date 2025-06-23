'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
}

interface VKPixelTestProps {
  propPixelId?: string
}

export function VKPixelTest({ propPixelId }: VKPixelTestProps) {
  const [pixelId, setPixelId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTestingAPI, setIsTestingAPI] = useState<boolean>(false)

  const addTestResult = (name: string, status: 'success' | 'error' | 'warning', message: string) => {
    setTestResults(prev => [...prev, { name, status, message }])
  }

  useEffect(() => {
    // Используем ID из пропсов или пытаемся получить из переменной окружения
    const id = propPixelId || process.env.NEXT_PUBLIC_VK_PIXEL_ID
    setPixelId(id || null)

    logDebug('VKPixelTest: VK Pixel ID from props:', propPixelId)
    logDebug('VKPixelTest: VK Pixel ID from env:', process.env.NEXT_PUBLIC_VK_PIXEL_ID)
    logDebug('VKPixelTest: Final VK Pixel ID:', id)

    // Проверяем загрузку VK Pixel
    const checkVKPixel = () => {
      logDebug('VKPixelTest: Checking VK pixel...', typeof (window as any).VK)
      if (typeof (window as any).VK !== 'undefined' && typeof (window as any).VK.Retargeting !== 'undefined') {
        setIsLoaded(true)
        addTestResult('Initialization', 'success', 'VK Pixel loaded successfully')
        logDebug('VKPixelTest: VK Pixel loaded successfully!')
      } else {
        setIsLoaded(false)
        addTestResult('Initialization', 'error', 'VK Pixel not found')
        logDebug('VKPixelTest: VK Pixel not found')
      }
    }

    // Проверяем сразу и через интервалы
    checkVKPixel()
    const interval = setInterval(checkVKPixel, 1000)

    // Очищаем интервал через 10 секунд
    setTimeout(() => clearInterval(interval), 10000)

    return () => clearInterval(interval)
  }, [propPixelId])

  const testVKPixelAPI = async () => {
    setIsTestingAPI(true)
    try {
      const response = await fetch('/api/test/vk-pixel')
      const data = await response.json()
      
      if (data.status === 'success') {
        addTestResult('API Test', 'success', data.message)
      } else {
        addTestResult('API Test', 'error', data.message)
      }
      
      logInfo('VK Pixel API test result:', data)
    } catch (error) {
      addTestResult('API Test', 'error', 'Failed to test VK Pixel API')
      logError('VK Pixel API test failed:', error)
    } finally {
      setIsTestingAPI(false)
    }
  }

  const sendTestEvent = () => {
    if (typeof (window as any).VK !== 'undefined' && typeof (window as any).VK.Goal === 'function') {
      try {
        (window as any).VK.Goal('conversion', { value: 100 })
        addTestResult('Test Event', 'success', 'Test conversion event sent with value 100')
        logInfo('VK Pixel: Test conversion event sent')
      } catch (error) {
        addTestResult('Test Event', 'error', 'Failed to send test event')
        logError('VK Pixel: Failed to send test event:', error)
      }
    } else {
      addTestResult('Test Event', 'error', 'VK.Goal function not available')
      logWarn('VK Pixel: VK.Goal function not available')
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      warning: 'secondary' as const,
    }
    return variants[status as keyof typeof variants] || 'outline'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 VK Pixel Test
          {isLoaded ? (
            <Badge variant="default">Loaded</Badge>
          ) : (
            <Badge variant="destructive">Not Loaded</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Test VK Pixel integration and ad-blocker bypass
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pixel ID Info */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>VK Pixel ID:</strong> {pixelId || 'Not configured'}
          </p>
          <p className="text-sm text-muted-foreground">
            {pixelId ? 'Configured via environment variable' : 'Add NEXT_PUBLIC_VK_PIXEL_ID to .env.local'}
          </p>
        </div>

        {/* Test Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testVKPixelAPI} 
            disabled={isTestingAPI}
            variant="outline"
          >
            {isTestingAPI && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test API
          </Button>
          <Button 
            onClick={sendTestEvent} 
            disabled={!isLoaded}
            variant="outline"
          >
            Send Test Event
          </Button>
          <Button 
            onClick={clearResults} 
            variant="ghost"
            size="sm"
          >
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-2 p-2 border rounded">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{result.name}</span>
                    <Badge variant={getStatusBadge(result.status)} className="text-xs">
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How to verify:</strong></p>
          <p>1. Open browser DevTools (F12) → Console tab</p>
          <p>2. Look for "VK Pixel" log messages</p>
          <p>3. Check Network tab for requests to /vk-pixel/</p>
          <p>4. Visit your VK Ads dashboard to see real-time data</p>
        </div>
      </CardContent>
    </Card>
  )
}
