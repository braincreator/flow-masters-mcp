// FlowMasters Assistant Agent Page
// Generated with AI assistance for rapid development

import { Metadata } from 'next'
import { AgentChat } from '@/components/agents/AgentChat'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FlowMasters Assistant | AI Агенты',
  description: 'Персональный AI помощник по платформе FlowMasters. Получите помощь по настройке, интеграциям и автоматизации.',
}

const ASSISTANT_SUGGESTIONS = [
  'Как начать работу с FlowMasters?',
  'Объясни возможности AI агентов',
  'Помоги настроить интеграцию с CRM',
  'Покажи примеры автоматизации',
  'Как создать workflow в n8n?',
  'Настройка OpenWebUI',
]

export default function AssistantPage() {
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
              <div className="text-3xl mr-4">🤖</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FlowMasters Assistant</h1>
                <p className="text-gray-600">
                  Ваш персональный помощник по платформе FlowMasters
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Что я умею:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Объяснение функций платформы</li>
                  <li>• Пошаговые инструкции по настройке</li>
                  <li>• Рекомендации по лучшим практикам</li>
                  <li>• Помощь в выборе подходящих инструментов</li>
                  <li>• Решение технических вопросов</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Популярные вопросы:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "Как создать автоматизацию?"</li>
                  <li>• "Настройка интеграций с CRM"</li>
                  <li>• "Возможности AI агентов"</li>
                  <li>• "Лучшие практики n8n"</li>
                  <li>• "Начало работы с платформой"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <AgentChat
          agentType="assistant"
          placeholder="Спросите о FlowMasters..."
          suggestions={ASSISTANT_SUGGESTIONS}
        />
      </div>
    </div>
  )
}