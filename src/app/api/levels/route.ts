import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

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
    console.error('Error fetching levels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    )
  }
}
