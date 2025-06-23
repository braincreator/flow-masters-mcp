// Quick Automation Builder Agent Page
// Generated with AI assistance for rapid development

import { Metadata } from 'next'
import { AgentChat } from '@/components/agents/AgentChat'
import Link from 'next/link'
import { ArrowLeft, Zap, GitBranch, Settings, Monitor } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Automation Builder | AI Агенты FlowMasters',
  description: 'Быстрое создание автоматизированных workflow с помощью AI. Создавайте интеграции и автоматизации без программирования.',
}

const AUTOMATION_SUGGESTIONS = [
  'Автоматизировать обработку новых лидов',
  'Создать email уведомления при продажах',
  'Синхронизировать данные между CRM и маркетингом',
  'Настроить мониторинг системы',
  'Автоматические еженедельные отчеты',
  'Обработка форм с сайта',
]

const AUTOMATION_TEMPLATES = [
  {
    name: 'Обработка лидов',
    description: 'Автоматическая обработка новых лидов с уведомлениями',
    icon: '👥',
    difficulty: 'Начальный',
  },
  {
    name: 'Email маркетинг',
    description: 'Автоматические email кампании и последовательности',
    icon: '📧',
    difficulty: 'Средний',
  },
  {
    name: 'Синхронизация данных',
    description: 'Синхронизация между различными системами',
    icon: '🔄',
    difficulty: 'Продвинутый',
  },
  {
    name: 'Отчеты и аналитика',
    description: 'Автоматическое создание отчетов и дашбордов',
    icon: '📊',
    difficulty: 'Средний',
  },
]

export default function AutomationPage() {
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
              <div className="text-3xl mr-4">🔄</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quick Automation Builder</h1>
                <p className="text-gray-600">
                  Быстрое создание автоматизированных workflow для бизнес-процессов
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Что я умею:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                    Создание workflow из описания
                  </li>
                  <li className="flex items-center">
                    <GitBranch className="w-4 h-4 mr-2 text-green-500" />
                    Готовые шаблоны автоматизации
                  </li>
                  <li className="flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-blue-500" />
                    Настройка интеграций
                  </li>
                  <li className="flex items-center">
                    <Monitor className="w-4 h-4 mr-2 text-purple-500" />
                    Мониторинг выполнения
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Доступные интеграции:</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">Salesforce</div>
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">HubSpot</div>
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">Gmail</div>
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">Slack</div>
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">Telegram</div>
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">Stripe</div>
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">MongoDB</div>
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">MySQL</div>
                  <div className="bg-gray-50 rounded px-2 py-1 text-center">+50 еще</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Популярные шаблоны автоматизации</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {AUTOMATION_TEMPLATES.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {template.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <AgentChat
          agentType="automation"
          placeholder="Описать автоматизацию..."
          suggestions={AUTOMATION_SUGGESTIONS}
        />
      </div>
    </div>
  )
}