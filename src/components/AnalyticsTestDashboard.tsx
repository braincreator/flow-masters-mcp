'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Globe, Zap } from 'lucide-react'

interface TestResult {
  service: string
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  url?: string
  responseTime?: number
}

interface TestSummary {
  total: number
  success: number
  failed: number
  successRate: string
}

interface AnalyticsTestResponse {
  timestamp: string
  tests: TestResult[]
  summary: TestSummary
}

export function AnalyticsTestDashboard() {
  const [testResults, setTestResults] = useState<AnalyticsTestResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const runTests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test/analytics-bypass')
      const data = await response.json()
      setTestResults(data)
      setLastUpdate(new Date().toLocaleString())
    } catch (error) {
      console.error('Failed to run analytics tests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Analytics Bypass Test Dashboard
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Test Yandex Metrica and VK Pixel bypass functionality
            </p>
            <Button 
              onClick={runTests} 
              disabled={isLoading}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Testing...' : 'Run Tests'}
            </Button>
          </div>
        </CardHeader>
        
        {testResults && (
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{testResults.summary.total}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{testResults.summary.success}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{testResults.summary.successRate}</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {/* Test Results */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Test Results</h3>
              {testResults.tests.map((test, index) => (
                <Card key={index} className="border-l-4 border-l-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.service}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{test.test}</span>
                          {getStatusBadge(test.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{test.message}</p>
                        {test.url && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <code className="bg-muted px-1 py-0.5 rounded">{test.url}</code>
                          </div>
                        )}
                      </div>
                      {test.responseTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          {test.responseTime}ms
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Last Update */}
            {lastUpdate && (
              <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                Last updated: {lastUpdate}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Interpret Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <strong>Success:</strong> The service is accessible and bypass is working correctly.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <strong>Error:</strong> The service is blocked or proxy is not working. Check your network or proxy configuration.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div>
              <strong>Warning:</strong> Partial functionality or slower response times detected.
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <strong>Note:</strong> If direct access fails but proxy access succeeds, the bypass is working correctly and analytics will function properly for your users.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
