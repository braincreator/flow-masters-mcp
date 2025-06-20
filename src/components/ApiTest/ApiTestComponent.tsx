'use client'

import React, { useState } from 'react'

interface ApiTestResult {
  service: string
  status: 'success' | 'error' | 'loading'
  message: string
  responseTime?: number
}

export default function ApiTestComponent() {
  const [results, setResults] = useState<ApiTestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testApis = async () => {
    setIsLoading(true)
    setResults([])

    const apis = [
      {
        name: 'n8n API',
        url: '/api/test/n8n',
        key: process.env.NEXT_PUBLIC_N8N_API_KEY
      },
      {
        name: 'Crawl4AI API',
        url: '/api/test/crawl4ai',
        key: process.env.NEXT_PUBLIC_CRAWL4AI_API_TOKEN
      },
      {
        name: 'Yandex Metrika',
        url: '/api/test/metrika',
        key: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      }
    ]

    for (const api of apis) {
      const startTime = Date.now()
      
      try {
        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const responseTime = Date.now() - startTime
        
        if (response.ok) {
          const data = await response.json()
          setResults(prev => [...prev, {
            service: api.name,
            status: 'success',
            message: data.message || 'API доступен',
            responseTime
          }])
        } else {
          setResults(prev => [...prev, {
            service: api.name,
            status: 'error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            responseTime
          }])
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        setResults(prev => [...prev, {
          service: api.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Неизвестная ошибка',
          responseTime
        }])
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧪 Тестирование API интеграций</h2>
      
      <button
        onClick={testApis}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50"
      >
        {isLoading ? '🔄 Тестирование...' : '🚀 Запустить тесты'}
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">📊 Результаты тестирования:</h3>
          
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${
                    result.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.status === 'success' ? '✅' : '❌'}
                  </span>
                  <span className="font-medium">{result.service}</span>
                </div>
                
                {result.responseTime && (
                  <span className="text-sm text-gray-500">
                    {result.responseTime}ms
                  </span>
                )}
              </div>
              
              <p className={`mt-2 text-sm ${
                result.status === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">🔧 Конфигурация API:</h4>
        <div className="text-sm space-y-1">
          <div>n8n: {process.env.NEXT_PUBLIC_N8N_BASE_URL || 'не настроен'}</div>
          <div>Crawl4AI: {process.env.NEXT_PUBLIC_CRAWL4AI_BASE_URL || 'не настроен'}</div>
          <div>Яндекс.Метрика ID: {process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 'не настроен'}</div>
        </div>
      </div>
    </div>
  )
}
