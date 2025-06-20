// Smart Documentation Search Agent Page
// Generated with AI assistance for rapid development

import { Metadata } from 'next'
import { AgentChat } from '@/components/agents/AgentChat'
import Link from 'next/link'
import { ArrowLeft, Search, FileText, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Smart Search | AI Агенты FlowMasters',
  description: 'Умный поиск по документации FlowMasters с использованием AI. Найдите ответы на технические вопросы быстро и точно.',
}

const SEARCH_SUGGESTIONS = [
  'Как настроить webhook в n8n?',
  'Документация по Qdrant API',
  'Примеры интеграции с Flowise',
  'Настройка OpenWebUI',
  'Конфигурация Weaviate',
  'Crawl4AI руководство',
]

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/agents" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к агентам
          </Link>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-4">📚</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Documentation Search</h1>
                <p className="text-gray-600">
                  Умный поиск по документации с использованием AI
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Возможности поиска:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <Search className="w-4 h-4 mr-2 text-green-500" />
                    Векторный поиск по всей документации
                  </li>
                  <li className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    Анализ множественных источников
                  </li>
                  <li className="flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2 text-purple-500" />
                    Точные ответы с указанием источников
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Источники данных:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded px-2 py-1">FlowMasters Docs</div>
                  <div className="bg-gray-50 rounded px-2 py-1">n8n Documentation</div>
                  <div className="bg-gray-50 rounded px-2 py-1">Flowise Guides</div>
                  <div className="bg-gray-50 rounded px-2 py-1">Qdrant API</div>
                  <div className="bg-gray-50 rounded px-2 py-1">OpenWebUI</div>
                  <div className="bg-gray-50 rounded px-2 py-1">Tutorials & FAQ</div>
                </div>
              </div>
            </div>
            
            {/* Search Tips */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Советы для эффективного поиска:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Используйте конкретные термины: "настройка webhook n8n"</li>
                <li>• Задавайте вопросы естественным языком: "Как подключить CRM к автоматизации?"</li>
                <li>• Указывайте контекст: "ошибка при интеграции Salesforce через API"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <AgentChat
          agentType="search"
          placeholder="Найти в документации..."
          suggestions={SEARCH_SUGGESTIONS}
        />
      </div>
    </div>
  )
}