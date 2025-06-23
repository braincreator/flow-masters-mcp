// Smart Documentation Search Agent API
// Generated with AI assistance for rapid development

import { NextRequest, NextResponse } from 'next/server'
import { SmartDocumentationSearchAgent } from '@/lib/agents/implementations/search-agent'
import type { AgentRequest } from '@/lib/agents/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
const searchAgent = new SmartDocumentationSearchAgent()

/**
 * Smart Documentation Search Agent endpoint
 * POST /api/agents/search
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, history, userId, sessionId } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Search query is required' },
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

    const response = await searchAgent.process(agentRequest)

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date(),
    })

  } catch (error) {
    logError('Search agent error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Search failed' 
      },
      { status: 500 }
    )
  }
}

/**
 * Get search agent capabilities
 * GET /api/agents/search
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: searchAgent.getInfo(),
  })
}