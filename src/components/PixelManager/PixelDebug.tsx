'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

interface PixelDebugInfo {
  // API данные
  pixelsFromAPI: any[]
  apiError: string | null
  
  // Состояние скриптов
  vkLoaded: boolean
  fbqLoaded: boolean
  gtagLoaded: boolean
  ymLoaded: boolean
  
  // Найденные скрипты
  pixelScripts: string[]
  
  // Cookie consent
  cookieConsent: any
  
  timestamp: string
}

export function PixelDebug() {
  const [debugInfo, setDebugInfo] = useState<PixelDebugInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const checkPixelStatus = async () => {
    try {
      // Проверяем API
      const response = await fetch('/api/pixels/active?page=all')
      const apiData = response.ok ? await response.json() : null
      
      // Проверяем загруженные скрипты
      const pixelScripts = Array.from(document.querySelectorAll('script'))
        .map(script => script.id || script.src)
        .filter(id => id && (
          id.includes('pixel') || 
          id.includes('metrika') || 
          id.includes('gtag') || 
          id.includes('fbevents') ||
          id.includes('vk-')
        ))

      // Проверяем глобальные объекты
      const info: PixelDebugInfo = {
        pixelsFromAPI: apiData?.pixels || [],
        apiError: response.ok ? null : `API Error: ${response.status}`,
        
        vkLoaded: typeof window !== 'undefined' && 'VK' in window && !!(window as any).VK?.Retargeting,
        fbqLoaded: typeof window !== 'undefined' && 'fbq' in window,
        gtagLoaded: typeof window !== 'undefined' && 'gtag' in window,
        ymLoaded: typeof window !== 'undefined' && 'ym' in window,
        
        pixelScripts,
        
        cookieConsent: typeof window !== 'undefined' ? {
          gdprStatus: document.cookie.includes('gdpr_consent_status'),
          detailedConsent: document.cookie.includes('gdpr_detailed_consent'),
        } : null,
        
        timestamp: new Date().toISOString()
      }
      
      setDebugInfo(info)
      logDebug('Pixel Debug Info:', info)
      
    } catch (error) {
      logError('Error checking pixel status:', error)
    }
  }

  useEffect(() => {
    if (isVisible) {
      checkPixelStatus()
    }
  }, [isVisible])

  const testVKPixel = () => {
    if (typeof window !== 'undefined' && (window as any).VK?.Retargeting) {
      (window as any).VK.Retargeting.Event('test_event')
      logInfo('VK Pixel test event sent')
    } else {
      logWarn('VK Pixel not loaded')
    }
  }

  const testYandexMetrika = () => {
    if (typeof window !== 'undefined' && (window as any).ym) {
      // Найдем первый счетчик Яндекс.Метрики
      const firstPixel = debugInfo?.pixelsFromAPI.find(p => p.type === 'yandex_metrica')
      if (firstPixel) {
        (window as any).ym(firstPixel.pixelId, 'reachGoal', 'test_goal')
        logInfo(`Yandex Metrika test goal sent to ${firstPixel.pixelId}`)
      }
    } else {
      logWarn('Yandex Metrika not loaded')
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
        >
          🔍 Pixel Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">🔍 Pixel Debug</CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          {/* API Status */}
          <div>
            <strong>API Status:</strong>
            {debugInfo?.apiError ? (
              <Badge variant="destructive" className="ml-1">Error</Badge>
            ) : (
              <Badge variant="default" className="ml-1">
                {debugInfo?.pixelsFromAPI.length || 0} pixels
              </Badge>
            )}
          </div>

          {/* Loaded Scripts */}
          <div>
            <strong>Loaded Scripts:</strong>
            <div className="flex gap-1 mt-1">
              <Badge variant={debugInfo?.vkLoaded ? "default" : "secondary"}>
                VK {debugInfo?.vkLoaded ? '✓' : '✗'}
              </Badge>
              <Badge variant={debugInfo?.fbqLoaded ? "default" : "secondary"}>
                FB {debugInfo?.fbqLoaded ? '✓' : '✗'}
              </Badge>
              <Badge variant={debugInfo?.gtagLoaded ? "default" : "secondary"}>
                GA {debugInfo?.gtagLoaded ? '✓' : '✗'}
              </Badge>
              <Badge variant={debugInfo?.ymLoaded ? "default" : "secondary"}>
                YM {debugInfo?.ymLoaded ? '✓' : '✗'}
              </Badge>
            </div>
          </div>

          {/* Pixels from API */}
          {debugInfo?.pixelsFromAPI && debugInfo.pixelsFromAPI.length > 0 && (
            <div>
              <strong>Configured Pixels:</strong>
              <div className="space-y-1 mt-1">
                {debugInfo.pixelsFromAPI.map((pixel, index) => (
                  <div key={index} className="text-xs">
                    <Badge variant="outline" className="mr-1">{pixel.type}</Badge>
                    {pixel.name} ({pixel.pixelId})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Buttons */}
          <div className="flex gap-1 pt-2">
            <Button size="sm" variant="outline" onClick={checkPixelStatus}>
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={testVKPixel}>
              Test VK
            </Button>
            <Button size="sm" variant="outline" onClick={testYandexMetrika}>
              Test YM
            </Button>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground">
            Last check: {debugInfo?.timestamp ? new Date(debugInfo.timestamp).toLocaleTimeString() : 'Never'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
