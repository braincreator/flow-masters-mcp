// Multimodal AI Assistant Page - Powered by Gemini Pro Vision
// Generated with AI assistance for rapid development

import { Metadata } from 'next'
import { AgentChat } from '@/components/agents/AgentChat'
import Link from 'next/link'
import { ArrowLeft, Eye, Image as ImageIcon, FileText, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Multimodal AI Assistant | AI Агенты FlowMasters',
  description: 'Анализ изображений и мультимедиа контента с помощью Gemini Pro Vision. OCR, анализ диаграмм, описание интерфейсов.',
}

const MULTIMODAL_SUGGESTIONS = [
  'Проанализируй этот скриншот интерфейса',
  'Извлеки текст из изображения',
  'Опиши что на этой диаграмме',
  'Анализ workflow схемы',
  'Распознать данные в таблице',
  'Описать UI элементы',
]

export default function MultimodalPage() {
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
              <div className="text-3xl mr-4">👁️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Multimodal AI Assistant</h1>
                <p className="text-gray-600">
                  Анализ изображений и мультимедиа контента с помощью Gemini Pro Vision
                </p>
              </div>
              <div className="ml-auto">
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  Powered by Gemini Pro Vision
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Возможности анализа:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
                    Анализ изображений и фотографий
                  </li>
                  <li className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                    OCR - распознавание текста
                  </li>
                  <li className="flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-purple-500" />
                    Анализ диаграмм и схем
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-orange-500" />
                    Описание интерфейсов и UI
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Типы контента:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded px-2 py-1">Скриншоты UI</div>
                  <div className="bg-gray-50 rounded px-2 py-1">Диаграммы</div>
                  <div className="bg-gray-50 rounded px-2 py-1">Документы</div>
                  <div className="bg-gray-50 rounded px-2 py-1">Схемы</div>
                  <div className="bg-gray-50 rounded px-2 py-1">Таблицы</div>
                  <div className="bg-gray-50 rounded px-2 py-1">Графики</div>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <ImageIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">Анализ изображений</h4>
                </div>
                <p className="text-sm text-blue-800">
                  Детальное описание содержимого, объектов и структуры изображений
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-900">OCR и извлечение данных</h4>
                </div>
                <p className="text-sm text-green-800">
                  Распознавание текста и извлечение структурированных данных
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-medium text-purple-900">Автоматизация</h4>
                </div>
                <p className="text-sm text-purple-800">
                  Создание автоматизаций на основе анализа интерфейсов
                </p>
              </div>
            </div>
            
            {/* Usage Tips */}
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">💡 Советы по использованию:</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Загружайте четкие изображения для лучшего анализа</li>
                <li>• Описывайте что именно вас интересует в изображении</li>
                <li>• Используйте для анализа workflow диаграмм и создания автоматизаций</li>
                <li>• Поддерживаются форматы: JPG, PNG, GIF, WebP, BMP</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <AgentChat
          agentType="multimodal"
          placeholder="Загрузите изображение или задайте вопрос..."
          suggestions={MULTIMODAL_SUGGESTIONS}
        />
      </div>
    </div>
  )
}