'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export function YandexMetrikaDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const checkEnvironment = () => {
      const info = {
        // Environment variables
        metrikaIdFromEnv: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
        nodeEnv: process.env.NODE_ENV,
        
        // Window object checks
        windowYm: typeof window !== 'undefined' ? typeof window.ym : 'undefined',
        windowYmExists: typeof window !== 'undefined' ? !!window.ym : false,
        
        // Script checks
        metrikaScripts: typeof window !== 'undefined' ? 
          Array.from(document.querySelectorAll('script')).filter(script => 
            script.src.includes('mc.yandex.ru') || script.innerHTML.includes('ym(')
          ).length : 0,
        
        // Console logs check
        timestamp: new Date().toISOString()
      }
      
      setDebugInfo(info)
      logDebug('Yandex Metrika Debug Info:', info)
    }

    checkEnvironment()
    
    // Check every 2 seconds for 10 seconds
    const interval = setInterval(checkEnvironment, 2000)
    setTimeout(() => clearInterval(interval), 10000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto mb-4">
      <CardHeader>
        <CardTitle>🔍 Yandex Metrika Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm font-mono">
          <div>
            <strong>Environment Variable:</strong> {debugInfo.metrikaIdFromEnv || 'NOT SET'}
          </div>
          <div>
            <strong>Node Environment:</strong> {debugInfo.nodeEnv}
          </div>
          <div>
            <strong>window.ym type:</strong> {debugInfo.windowYm}
          </div>
          <div>
            <strong>window.ym exists:</strong> {debugInfo.windowYmExists ? '✅ YES' : '❌ NO'}
          </div>
          <div>
            <strong>Metrika scripts found:</strong> {debugInfo.metrikaScripts}
          </div>
          <div>
            <strong>Last check:</strong> {debugInfo.timestamp}
          </div>
        </div>
        
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <strong>Full debug object:</strong>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
  )
}
