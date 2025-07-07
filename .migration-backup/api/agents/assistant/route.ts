// FlowMasters Assistant Agent API
// Generated with AI assistance for rapid development

import { NextRequest, NextResponse } from 'next/server'
import { FlowMastersAssistantAgent } from '@/lib/agents/implementations/assistant-agent'
import type { AgentRequest } from '@/lib/agents/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
const assistantAgent = new FlowMastersAssistantAgent()

/**
 * FlowMasters Assistant Agent endpoint
 * POST /api/agents/assistant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, history, userId, sessionId } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const agentRequest: AgentRequest = {
      message,
      context,
      history,
      userId,
      sessionId,
    }

    const response = await assistantAgent.process(agentRequest)

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date(),
    })

  } catch (error) {
    logError('Assistant agent error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * Get assistant agent capabilities
 * GET /api/agents/assistant
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: assistantAgent.getInfo(),
  })
}