import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

export async function GET(request: NextRequest) {
  try {
    const achievements = await payload.find({
      collection: 'achievements',
      where: {
        status: {
          equals: 'active',
        },
      },
    })
    
    return NextResponse.json(achievements.docs)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
