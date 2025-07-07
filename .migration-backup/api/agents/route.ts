// FlowMasters AI Agents - Main API Route
// Generated with AI assistance for rapid development

import { NextRequest, NextResponse } from 'next/server'
import { FlowMastersAssistantAgent } from '@/lib/agents/implementations/assistant-agent'
import { SmartDocumentationSearchAgent } from '@/lib/agents/implementations/search-agent'
import { QuickAutomationBuilderAgent } from '@/lib/agents/implementations/automation-agent'
import { MultimodalAgent } from '@/lib/agents/implementations/multimodal-agent'
import type { AgentRequest, AgentResponse, AgentType } from '@/lib/agents/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Initialize agents with Vertex AI support
const agents = {
  assistant: new FlowMastersAssistantAgent(),
  search: new SmartDocumentationSearchAgent(),
  automation: new QuickAutomationBuilderAgent(),
  multimodal: new MultimodalAgent(),
}

/**
 * Main API endpoint for all AI agents
 * POST /api/agents
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Parse request body
    const body = await request.json()
    const { agentType, message, context, history, userId, sessionId }: {
      agentType: AgentType
      message: string
      context?: any
      history?: any[]
      userId?: string
      sessionId?: string
    } = body

    // Validate required fields
    if (!agentType || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_FIELDS',
            message: 'agentType and message are required',
            timestamp: new Date(),
          }
        },
        { status: 400 }
      )
    }

    // Check if agent exists
    const agent = agents[agentType]
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AGENT_NOT_FOUND',
            message: `Agent type '${agentType}' not found`,
            timestamp: new Date(),
          }
        },
        { status: 404 }
      )
    }

    // Create agent request
    const agentRequest: AgentRequest = {
      message,
      context,
      history,
      userId,
      sessionId: sessionId || generateSessionId(),
    }

    // Process request with the appropriate agent
    const response: AgentResponse = await agent.process(agentRequest)

    // Create API response
    const apiResponse = {
      success: true,
      data: response,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
        agentType,
      }
    }

    return NextResponse.json(apiResponse)

  } catch (error) {
    logError('Agent API error:', error)
    
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      },
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/**
 * Get available agents and their capabilities
 * GET /api/agents
 */
export async function GET() {
  try {
    const agentInfo = Object.entries(agents).map(([type, agent]) => ({
      type,
      ...agent.getInfo(),
    }))

    return NextResponse.json({
      success: true,
      data: {
        agents: agentInfo,
        totalAgents: agentInfo.length,
      },
      metadata: {
        timestamp: new Date(),
      }
    })
  } catch (error) {
    logError('Error getting agent info:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get agent information',
        timestamp: new Date(),
      }
    }, { status: 500 })
  }
}

/**
 * Health check endpoint
 * GET /api/agents/health
 */
export async function HEAD() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      agents: Object.keys(agents),
      timestamp: new Date(),
    }
  })
}

// Helper functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}