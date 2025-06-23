'use client'

// FlowMasters AI Agents - Chat Component
// Generated with AI assistance for rapid development

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, ExternalLink, Play } from 'lucide-react'
import type { AgentType, AgentResponse, Message } from '@/lib/agents/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface AgentChatProps {
  agentType: AgentType
  placeholder?: string
  suggestions?: string[]
  className?: string
}

export function AgentChat({ 
  agentType, 
  placeholder = 'Задайте вопрос...',
  suggestions = [],
  className = ''
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/agents/${agentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          context: {
            currentPage: window.location.pathname,
            userAgent: navigator.userAgent,
          },
          history: messages.slice(-5), // Last 5 messages for context
          userId: 'anonymous', // TODO: Get from auth
          sessionId: getSessionId(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error')
      }

      const agentResponse: AgentResponse = data.data
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: agentResponse.content,
        timestamp: new Date(),
        metadata: {
          agentType,
          processingTime: agentResponse.metadata?.processingTime,
          sources: agentResponse.sources,
        },
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      logError('Chat error:', err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const getAgentIcon = () => {
    switch (agentType) {
      case 'assistant': return '🤖'
      case 'search': return '📚'
      case 'automation': return '🔄'
      default: return '🤖'
    }
  }

  const getAgentName = () => {
    switch (agentType) {
      case 'assistant': return 'FlowMasters Assistant'
      case 'search': return 'Smart Search'
      case 'automation': return 'Automation Builder'
      default: return 'AI Agent'
    }
  }

  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="text-2xl mr-3">{getAgentIcon()}</div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{getAgentName()}</h2>
          <p className="text-sm text-gray-600">
            {agentType === 'assistant' && 'Ваш персональный помощник по платформе'}
            {agentType === 'search' && 'Умный поиск по документации'}
            {agentType === 'automation' && 'Создание автоматизированных workflow'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">{getAgentIcon()}</div>
            <p className="text-lg mb-2">Привет! Я {getAgentName()}</p>
            <p className="text-sm">Задайте мне любой вопрос, и я помогу вам</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              
              {/* Sources */}
              {message.metadata?.sources && message.metadata.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Источники:</p>
                  {message.metadata.sources.slice(0, 3).map((source, index) => (
                    <div key={source.id} className="flex items-center text-xs text-blue-600 hover:text-blue-800">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      <span className="truncate">{source.title}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Processing time */}
              {message.metadata?.processingTime && (
                <div className="text-xs text-gray-500 mt-1">
                  Обработано за {message.metadata.processingTime}мс
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Обрабатываю запрос...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && messages.length === 0 && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">Попробуйте спросить:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-sm bg-white hover:bg-gray-100 border border-gray-200 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {input.length}/1000 символов
        </div>
      </form>
    </div>
  )
}

// Helper function to get/create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('flowmasters_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('flowmasters_session_id', sessionId)
  }
  return sessionId
}