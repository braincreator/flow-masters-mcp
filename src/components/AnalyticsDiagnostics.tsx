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
  Shield,
  Globe,
  Zap,
  Eye,
  Settings,
  Smartphone,
  Monitor
} from 'lucide-react'

interface DiagnosticResult {
  category: string
  name: string
  status: 'pass' | 'fail' | 'warning' | 'info'
  message: string
  details?: string
  fix?: string
}

export function AnalyticsDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [serverResults, setServerResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setIsLoading(true)
    const diagnostics: DiagnosticResult[] = []

    try {
      // 1. Browser Environment Tests
      diagnostics.push(...await runBrowserTests())
      
      // 2. Ad Blocker Detection
      diagnostics.push(...await runAdBlockerTests())
      
      // 3. JavaScript Environment
      diagnostics.push(...await runJavaScriptTests())
      
      // 4. Cookie and Storage Tests
      diagnostics.push(...await runStorageTests())
      
      // 5. Network and Performance
      diagnostics.push(...await runNetworkTests())
      
      // 6. Analytics Objects Tests
      diagnostics.push(...await runAnalyticsTests())

      // 7. Server-side tests
      try {
        const serverResponse = await fetch('/api/test/analytics-diagnostics')
        const serverData = await serverResponse.json()
        setServerResults(serverData)
        diagnostics.push(...convertServerResults(serverData))
      } catch (error) {
        diagnostics.push({
          category: 'Server',
          name: 'Server Diagnostics',
          status: 'fail',
          message: 'Failed to run server-side tests',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      setResults(diagnostics)
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Diagnostics failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runBrowserTests = async (): Promise<DiagnosticResult[]> => {
    const tests: DiagnosticResult[] = []

    // JavaScript enabled
    tests.push({
      category: 'Browser',
      name: 'JavaScript Enabled',
      status: 'pass',
      message: 'JavaScript is working correctly'
    })

    // Cookies enabled
    const cookiesEnabled = navigator.cookieEnabled
    tests.push({
      category: 'Browser',
      name: 'Cookies Enabled',
      status: cookiesEnabled ? 'pass' : 'fail',
      message: cookiesEnabled ? 'Cookies are enabled' : 'Cookies are disabled',
      fix: !cookiesEnabled ? 'Enable cookies in browser settings' : undefined
    })

    // Do Not Track
    const dnt = navigator.doNotTrack === '1' || (window as any).doNotTrack === '1'
    tests.push({
      category: 'Browser',
      name: 'Do Not Track',
      status: dnt ? 'warning' : 'pass',
      message: dnt ? 'Do Not Track is enabled' : 'Do Not Track is disabled',
      details: dnt ? 'Some analytics may respect this setting' : undefined
    })

    // Private/Incognito mode detection
    const isPrivate = await detectPrivateMode()
    tests.push({
      category: 'Browser',
      name: 'Private Mode',
      status: isPrivate ? 'warning' : 'pass',
      message: isPrivate ? 'Private/Incognito mode detected' : 'Normal browsing mode',
      details: isPrivate ? 'Analytics may be limited in private mode' : undefined
    })

    // User Agent
    const userAgent = navigator.userAgent
    const isBot = /bot|crawler|spider|headless/i.test(userAgent)
    tests.push({
      category: 'Browser',
      name: 'User Agent',
      status: isBot ? 'warning' : 'pass',
      message: isBot ? 'Bot or automated browser detected' : 'Normal browser detected',
      details: userAgent
    })

    return tests
  }

  const runAdBlockerTests = async (): Promise<DiagnosticResult[]> => {
    const tests: DiagnosticResult[] = []

    // Test for common ad blocker signatures
    const adBlockerTests = [
      {
        name: 'AdBlock Detection',
        test: () => {
          // Create a test element that ad blockers typically hide
          const testAd = document.createElement('div')
          testAd.innerHTML = '&nbsp;'
          testAd.className = 'adsbox'
          testAd.style.position = 'absolute'
          testAd.style.left = '-10000px'
          document.body.appendChild(testAd)
          
          const isBlocked = testAd.offsetHeight === 0
          document.body.removeChild(testAd)
          return !isBlocked
        }
      },
      {
        name: 'uBlock Origin Detection',
        test: () => {
          return !(window as any).uBlockOrigin
        }
      },
      {
        name: 'Analytics Script Loading',
        test: async () => {
          try {
            // Try to load a test analytics script
            const script = document.createElement('script')
            script.src = '/metrika/tag_ww.js'
            
            return new Promise<boolean>((resolve) => {
              script.onload = () => resolve(true)
              script.onerror = () => resolve(false)
              document.head.appendChild(script)
              
              setTimeout(() => {
                document.head.removeChild(script)
                resolve(false)
              }, 3000)
            })
          } catch {
            return false
          }
        }
      }
    ]

    for (const test of adBlockerTests) {
      try {
        const result = await test.test()
        tests.push({
          category: 'Ad Blocker',
          name: test.name,
          status: result ? 'pass' : 'fail',
          message: result ? 'No blocking detected' : 'Blocking detected',
          fix: !result ? 'Disable ad blocker or whitelist this site' : undefined
        })
      } catch (error) {
        tests.push({
          category: 'Ad Blocker',
          name: test.name,
          status: 'warning',
          message: 'Test failed to run',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return tests
  }

  const runJavaScriptTests = async (): Promise<DiagnosticResult[]> => {
    const tests: DiagnosticResult[] = []

    // Console errors
    const originalError = console.error
    const errors: string[] = []
    console.error = (...args) => {
      errors.push(args.join(' '))
      originalError.apply(console, args)
    }

    setTimeout(() => {
      console.error = originalError
      tests.push({
        category: 'JavaScript',
        name: 'Console Errors',
        status: errors.length === 0 ? 'pass' : 'warning',
        message: errors.length === 0 ? 'No console errors' : `${errors.length} console errors detected`,
        details: errors.length > 0 ? errors.slice(0, 3).join('; ') : undefined
      })
    }, 1000)

    // Global objects pollution
    const globalKeys = Object.keys(window).length
    tests.push({
      category: 'JavaScript',
      name: 'Global Namespace',
      status: globalKeys > 500 ? 'warning' : 'pass',
      message: `${globalKeys} global objects`,
      details: globalKeys > 500 ? 'High number of global objects may indicate conflicts' : undefined
    })

    return tests
  }

  const runStorageTests = async (): Promise<DiagnosticResult[]> => {
    const tests: DiagnosticResult[] = []

    // Local Storage
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      tests.push({
        category: 'Storage',
        name: 'Local Storage',
        status: 'pass',
        message: 'Local Storage is available'
      })
    } catch {
      tests.push({
        category: 'Storage',
        name: 'Local Storage',
        status: 'fail',
        message: 'Local Storage is not available',
        fix: 'Enable local storage in browser settings'
      })
    }

    // Session Storage
    try {
      sessionStorage.setItem('test', 'test')
      sessionStorage.removeItem('test')
      tests.push({
        category: 'Storage',
        name: 'Session Storage',
        status: 'pass',
        message: 'Session Storage is available'
      })
    } catch {
      tests.push({
        category: 'Storage',
        name: 'Session Storage',
        status: 'fail',
        message: 'Session Storage is not available'
      })
    }

    return tests
  }

  const runNetworkTests = async (): Promise<DiagnosticResult[]> => {
    const tests: DiagnosticResult[] = []

    // Connection type
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      tests.push({
        category: 'Network',
        name: 'Connection Type',
        status: 'info',
        message: `${connection.effectiveType || 'unknown'} connection`,
        details: `Downlink: ${connection.downlink || 'unknown'} Mbps`
      })
    }

    // Online status
    tests.push({
      category: 'Network',
      name: 'Online Status',
      status: navigator.onLine ? 'pass' : 'fail',
      message: navigator.onLine ? 'Browser is online' : 'Browser is offline'
    })

    return tests
  }

  const runAnalyticsTests = async (): Promise<DiagnosticResult[]> => {
    const tests: DiagnosticResult[] = []

    // Wait a bit for analytics to load
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Yandex Metrika
    tests.push({
      category: 'Analytics',
      name: 'Yandex Metrika',
      status: typeof (window as any).ym !== 'undefined' ? 'pass' : 'fail',
      message: typeof (window as any).ym !== 'undefined' ? 'Yandex Metrika loaded' : 'Yandex Metrika not loaded',
      fix: typeof (window as any).ym === 'undefined' ? 'Check script loading and ad blockers' : undefined
    })

    // VK Pixel
    tests.push({
      category: 'Analytics',
      name: 'VK Pixel',
      status: typeof (window as any).VK !== 'undefined' ? 'pass' : 'fail',
      message: typeof (window as any).VK !== 'undefined' ? 'VK Pixel loaded' : 'VK Pixel not loaded',
      fix: typeof (window as any).VK === 'undefined' ? 'Check VK script loading' : undefined
    })

    // Google Analytics
    tests.push({
      category: 'Analytics',
      name: 'Google Analytics',
      status: typeof (window as any).gtag !== 'undefined' || typeof (window as any).ga !== 'undefined' ? 'pass' : 'warning',
      message: typeof (window as any).gtag !== 'undefined' || typeof (window as any).ga !== 'undefined' ? 'Google Analytics loaded' : 'Google Analytics not detected'
    })

    return tests
  }

  const convertServerResults = (serverData: any): DiagnosticResult[] => {
    const tests: DiagnosticResult[] = []

    // DNS tests
    serverData.tests.dns.forEach((dns: any) => {
      tests.push({
        category: 'DNS',
        name: `${dns.domain} Resolution`,
        status: dns.accessible ? 'pass' : 'fail',
        message: dns.accessible ? `Accessible (${dns.responseTime}ms)` : 'Not accessible',
        details: dns.error || undefined
      })
    })

    // Network tests
    serverData.tests.network.forEach((net: any) => {
      tests.push({
        category: 'Network',
        name: net.name,
        status: net.passed ? 'pass' : net.severity === 'warning' ? 'warning' : 'fail',
        message: net.message
      })
    })

    return tests
  }

  const detectPrivateMode = async (): Promise<boolean> => {
    try {
      // Try to use storage APIs that are restricted in private mode
      const storage = window.sessionStorage
      storage.setItem('test', '1')
      storage.removeItem('test')
      return false
    } catch {
      return true
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500">Пройден</Badge>
      case 'fail':
        return <Badge variant="destructive">Ошибка</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500">Предупреждение</Badge>
      case 'info':
        return <Badge variant="outline">Информация</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Browser':
        return <Monitor className="h-4 w-4" />
      case 'Ad Blocker':
        return <Shield className="h-4 w-4" />
      case 'JavaScript':
        return <Settings className="h-4 w-4" />
      case 'Storage':
        return <Zap className="h-4 w-4" />
      case 'Network':
        return <Globe className="h-4 w-4" />
      case 'Analytics':
        return <Eye className="h-4 w-4" />
      case 'DNS':
        return <Globe className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = []
    }
    acc[result.category].push(result)
    return acc
  }, {} as Record<string, DiagnosticResult[]>)

  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warnings: results.filter(r => r.status === 'warning').length
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Комплексная диагностика аналитики
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Полная проверка всех возможных проблем с аналитическими счетчиками
            </p>
            <Button 
              onClick={runDiagnostics} 
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Диагностика...' : 'Запустить диагностику'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Всего тестов</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-muted-foreground">Пройдено</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-muted-foreground">Ошибок</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-muted-foreground">Предупреждений</div>
            </div>
          </div>

          {/* Results by Category */}
          <div className="space-y-4">
            {Object.entries(groupedResults).map(([category, tests]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getCategoryIcon(category)}
                    {category}
                    <Badge variant="outline">{tests.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tests.map((test, index) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(test.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{test.name}</span>
                              {getStatusBadge(test.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{test.message}</p>
                            {test.details && (
                              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                {test.details}
                              </p>
                            )}
                            {test.fix && (
                              <Alert className="mt-2">
                                <Info className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  <strong>Решение:</strong> {test.fix}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Server Results Summary */}
          {serverResults && (
            <Card>
              <CardHeader>
                <CardTitle>Серверная диагностика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold">{serverResults.summary.totalTests}</div>
                    <div className="text-sm text-muted-foreground">Тестов</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{serverResults.summary.passed}</div>
                    <div className="text-sm text-muted-foreground">Успешно</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{serverResults.summary.failed}</div>
                    <div className="text-sm text-muted-foreground">Ошибок</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{serverResults.summary.warnings}</div>
                    <div className="text-sm text-muted-foreground">Предупреждений</div>
                  </div>
                </div>
                
                {serverResults.recommendations.length > 0 && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <strong>Рекомендации сервера:</strong>
                        <ul className="list-disc list-inside space-y-1">
                          {serverResults.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
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
