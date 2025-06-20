'use client'

// FlowMasters AI Agents - Main Interface Component
// Generated with AI assistance for rapid development

import { useState } from 'react'
import { ArrowLeft, Settings, BarChart3 } from 'lucide-react'
import { AgentSelector } from './AgentSelector'
import { AgentChat } from './AgentChat'
import type { AgentType } from '@/lib/agents/types'

interface AgentInterfaceProps {
  className?: string
}

export function AgentInterface({ className = '' }: AgentInterfaceProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const handleAgentSelect = (agentType: AgentType) => {
    setSelectedAgent(agentType)
  }

  const handleBackToSelector = () => {
    setSelectedAgent(null)
  }

  const getAgentSuggestions = (agentType: AgentType): string[] => {
    switch (agentType) {
      case 'assistant':
        return [
          'Как начать работу с FlowMasters?',
          'Объясни возможности AI агентов',
          'Помоги настроить интеграцию с CRM',
          'Покажи примеры автоматизации',
        ]
      case 'search':
        return [
          'Как настроить webhook в n8n?',
          'Документация по Qdrant API',
          'Примеры интеграции с Flowise',
          'Настройка OpenWebUI',
        ]
      case 'automation':
        return [
          'Автоматизировать обработку новых лидов',
          'Создать email уведомления',
          'Синхронизировать данные между системами',
          'Настроить мониторинг процессов',
        ]
      default:
        return []
    }
  }

  const getAgentPlaceholder = (agentType: AgentType): string => {
    switch (agentType) {
      case 'assistant':
        return 'Спросите о FlowMasters...'
      case 'search':
        return 'Найти в документации...'
      case 'automation':
        return 'Описать автоматизацию...'
      default:
        return 'Задайте вопрос...'
    }
  }

  if (selectedAgent) {
    return (
      <div className={`h-full flex flex-col ${className}`}>
        {/* Header with back button */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <button
            onClick={handleBackToSelector}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад к выбору агентов
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Настройки"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Аналитика"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-50 border-b p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Настройки агента</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Уровень детализации</label>
                  <select className="w-full text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Краткие ответы</option>
                    <option>Подробные объяснения</option>
                    <option>Экспертный уровень</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Язык ответов</label>
                  <select className="w-full text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Русский</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Включить источники</label>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          <AgentChat
            agentType={selectedAgent}
            placeholder={getAgentPlaceholder(selectedAgent)}
            suggestions={getAgentSuggestions(selectedAgent)}
            className="h-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      <AgentSelector
        onAgentSelect={handleAgentSelect}
        selectedAgent={selectedAgent}
      />
    </div>
  )
}