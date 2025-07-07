// Multimodal Agent API - Powered by Gemini Pro Vision
// Generated with AI assistance for rapid development

import { NextRequest, NextResponse } from 'next/server'
import { MultimodalAgent } from '@/lib/agents/implementations/multimodal-agent'
import type { AgentRequest } from '@/lib/agents/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
const multimodalAgent = new MultimodalAgent()

/**
 * Multimodal Agent endpoint with image analysis support
 * POST /api/agents/multimodal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, history, userId, sessionId, imageUrl } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Enhanced context for multimodal processing
    const enhancedContext = {
      ...context,
      imageUrl, // Support for image URL in request
      multimodal: true,
      supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
    }

    const agentRequest: AgentRequest = {
      message,
      context: enhancedContext,
      history,
      userId,
      sessionId,
    }

    const response = await multimodalAgent.process(agentRequest)

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date(),
      provider: 'vertex-ai',
      model: 'gemini-2.5-flash-vision',
    })

  } catch (error) {
    logError('Multimodal agent error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Multimodal analysis failed' 
      },
      { status: 500 }
    )
  }
}

/**
 * Get multimodal agent capabilities
 * GET /api/agents/multimodal
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      ...multimodalAgent.getInfo(),
      supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
      maxImageSize: '10MB',
      features: [
        'image_analysis',
        'ocr_text_extraction', 
        'diagram_analysis',
        'ui_analysis',
        'document_analysis',
        'structured_data_extraction',
      ],
    },
  })
}