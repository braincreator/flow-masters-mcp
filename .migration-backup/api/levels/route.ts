import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(request: NextRequest) {
  try {
    // Получаем сервис уровней
    const serviceRegistry = payload.services
    if (!serviceRegistry) {
      return NextResponse.json(
        { error: 'Service registry not available' },
        { status: 500 }
      )
    }
    
    const userLevelService = serviceRegistry.getUserLevelService()
    const levels = userLevelService.getAllLevels()
    
    return NextResponse.json(levels)
  } catch (error) {
    logError('Error fetching levels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    )
  }
}
