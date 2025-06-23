// Quick Automation Builder Agent API
// Generated with AI assistance for rapid development

import { NextRequest, NextResponse } from 'next/server'
import { QuickAutomationBuilderAgent } from '@/lib/agents/implementations/automation-agent'
import type { AgentRequest } from '@/lib/agents/types'

const automationAgent = new QuickAutomationBuilderAgent()

/**
 * Quick Automation Builder Agent endpoint
 * POST /api/agents/automation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, history, userId, sessionId } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Automation request is required' },
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

    const response = await automationAgent.process(agentRequest)

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date(),
    })

  } catch (error) {
    console.error('Automation agent error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Automation failed' 
      },
      { status: 500 }
    )
  }
}

/**
 * Get automation agent capabilities
 * GET /api/agents/automation
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: automationAgent.getInfo(),
  })
}