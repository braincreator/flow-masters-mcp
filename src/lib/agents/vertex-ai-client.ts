// Временная заглушка для AI клиента
// TODO: Восстановить после установки зависимостей

export interface AgentRequest {
  agentType: string
  message: string
  context?: any
  userId?: string
  sessionId?: string
}

export interface AgentResponse {
  success: boolean
  data: {
    response: string
    agentType: string
    timestamp: string
    processingTime: number
    suggestions?: string[]
  }
  error?: string
}

export class VertexAIClient {
  async processAgentRequest(request: AgentRequest): Promise<AgentResponse> {
    // Заглушка - возвращаем тестовый ответ
    return {
      success: true,
      data: {
        response: `Привет! Это тестовый ответ от ${request.agentType} агента. AI модуль временно отключен.`,
        agentType: request.agentType,
        timestamp: new Date().toISOString(),
        processingTime: 100,
        suggestions: [
          'Попробуйте другой вопрос',
          'Проверьте настройки AI'
        ]
      }
    }
  }
}

export const vertexAIClient = new VertexAIClient()
