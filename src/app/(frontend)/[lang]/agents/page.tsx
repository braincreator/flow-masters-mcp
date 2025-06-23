// FlowMasters AI Agents - Main Page
// Generated with AI assistance for rapid development

import { Metadata } from 'next'
import { AgentInterface } from '@/components/agents/AgentInterface'

export const metadata: Metadata = {
  title: 'AI Агенты | FlowMasters',
  description: 'Умные AI агенты для автоматизации бизнес-процессов. FlowMasters Assistant, Smart Search и Automation Builder.',
  keywords: ['AI агенты', 'автоматизация', 'FlowMasters', 'искусственный интеллект', 'чат-бот'],
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <AgentInterface className="min-h-screen" />
      </div>
    </div>
  )
}