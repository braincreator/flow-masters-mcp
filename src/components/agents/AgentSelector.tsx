'use client'

// FlowMasters AI Agents - Agent Selector Component
// Generated with AI assistance for rapid development

import { useState } from 'react'
import { Bot, Search, Zap, ArrowRight, Sparkles } from 'lucide-react'
import type { AgentType } from '@/lib/agents/types'

interface Agent {
  type: AgentType
  name: string
  description: string
  icon: string
  color: string
  capabilities: string[]
  examples: string[]
}

interface AgentSelectorProps {
  onAgentSelect: (agentType: AgentType) => void
  selectedAgent?: AgentType
  className?: string
}

const AVAILABLE_AGENTS: Agent[] = [
  {
    type: 'assistant',
    name: 'FlowMasters Assistant',
    description: 'Ваш персональный помощник по платформе FlowMasters',
    icon: '🤖',
    color: 'blue',
    capabilities: [
      'Объяснение функций платформы',
      'Пошаговые инструкции',
      'Рекомендации по настройке',
      'Решение технических вопросов',
    ],
    examples: [
      'Как создать автоматизацию в n8n?',
      'Объясни возможности AI агентов',
      'Помоги настроить интеграцию с CRM',
    ],
  },
  {
    type: 'search',
    name: 'Smart Documentation Search',
    description: 'Умный поиск по документации с использованием AI',
    icon: '📚',
    color: 'green',
    capabilities: [
      'Векторный поиск по документации',
      'Анализ множественных источников',
      'Точные ответы с источниками',
      'Предложение связанных тем',
    ],
    examples: [
      'Как настроить webhook в n8n?',
      'Документация по Qdrant API',
      'Примеры интеграции с Flowise',
    ],
  },
  {
    type: 'automation',
    name: 'Quick Automation Builder',
    description: 'Быстрое создание автоматизированных workflow',
    icon: '🔄',
    color: 'purple',
    capabilities: [
      'Создание workflow из описания',
      'Готовые шаблоны автоматизации',
      'Настройка интеграций',
      'Мониторинг выполнения',
    ],
    examples: [
      'Автоматизировать обработку новых лидов',
      'Создать email уведомления',
      'Синхронизировать данные между системами',
    ],
  },
  {
    type: 'multimodal',
    name: 'Multimodal AI Assistant',
    description: 'Анализ изображений и мультимедиа с Gemini Pro Vision',
    icon: '👁️',
    color: 'orange',
    capabilities: [
      'Анализ изображений и фотографий',
      'Распознавание текста (OCR)',
      'Анализ диаграмм и схем',
      'Описание интерфейсов и UI',
    ],
    examples: [
      'Проанализируй этот скриншот интерфейса',
      'Извлеки текст из изображения',
      'Опиши что на этой диаграмме',
    ],
  },
]

export function AgentSelector({ onAgentSelect, selectedAgent, className = '' }: AgentSelectorProps) {
  const [hoveredAgent, setHoveredAgent] = useState<AgentType | null>(null)

  const getColorClasses = (color: string, isSelected: boolean, isHovered: boolean) => {
    const baseClasses = 'transition-all duration-200'
    
    if (isSelected) {
      switch (color) {
        case 'blue': return `${baseClasses} bg-blue-50 border-blue-200 shadow-blue-100`
        case 'green': return `${baseClasses} bg-green-50 border-green-200 shadow-green-100`
        case 'purple': return `${baseClasses} bg-purple-50 border-purple-200 shadow-purple-100`
        case 'orange': return `${baseClasses} bg-orange-50 border-orange-200 shadow-orange-100`
        default: return `${baseClasses} bg-gray-50 border-gray-200`
      }
    }
    
    if (isHovered) {
      switch (color) {
        case 'blue': return `${baseClasses} bg-blue-25 border-blue-100 shadow-lg`
        case 'green': return `${baseClasses} bg-green-25 border-green-100 shadow-lg`
        case 'purple': return `${baseClasses} bg-purple-25 border-purple-100 shadow-lg`
        case 'orange': return `${baseClasses} bg-orange-25 border-orange-100 shadow-lg`
        default: return `${baseClasses} bg-gray-25 border-gray-100 shadow-lg`
      }
    }
    
    return `${baseClasses} bg-white border-gray-200 hover:shadow-md`
  }

  const getButtonClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'green': return 'bg-green-500 hover:bg-green-600 text-white'
      case 'purple': return 'bg-purple-500 hover:bg-purple-600 text-white'
      case 'orange': return 'bg-orange-500 hover:bg-orange-600 text-white'
      default: return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-blue-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">AI Агенты FlowMasters</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Выберите AI агента для решения ваших задач. Каждый агент специализируется на определенных функциях платформы.
        </p>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_AGENTS.map((agent) => {
          const isSelected = selectedAgent === agent.type
          const isHovered = hoveredAgent === agent.type
          
          return (
            <div
              key={agent.type}
              className={`relative border rounded-xl p-6 cursor-pointer ${getColorClasses(
                agent.color,
                isSelected,
                isHovered
              )}`}
              onMouseEnter={() => setHoveredAgent(agent.type)}
              onMouseLeave={() => setHoveredAgent(null)}
              onClick={() => onAgentSelect(agent.type)}
            >
              {/* Agent Icon and Name */}
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{agent.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </div>
              </div>

              {/* Capabilities */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Возможности:</h4>
                <ul className="space-y-1">
                  {agent.capabilities.slice(0, 3).map((capability, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                      {capability}
                    </li>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <li className="text-xs text-gray-500">
                      +{agent.capabilities.length - 3} еще...
                    </li>
                  )}
                </ul>
              </div>

              {/* Examples */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Примеры запросов:</h4>
                <div className="space-y-1">
                  {agent.examples.slice(0, 2).map((example, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                      "{example}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${getButtonClasses(
                  agent.color
                )}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onAgentSelect(agent.type)
                }}
              >
                {isSelected ? 'Выбран' : 'Выбрать агента'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-gray-600">Доступных агента</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">24/7</div>
            <div className="text-sm text-gray-600">Работают круглосуточно</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">&lt;2с</div>
            <div className="text-sm text-gray-600">Среднее время ответа</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Не знаете, какого агента выбрать? Начните с{' '}
          <button
            onClick={() => onAgentSelect('assistant')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            FlowMasters Assistant
          </button>
          {' '}— он поможет определить лучший вариант для ваших задач.
        </p>
      </div>
    </div>
  )
}