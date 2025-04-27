import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { getServerSession } from '@/lib/auth'

/**
 * Get user notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // Get Payload client
    const payload = await getPayloadClient()
    
    // Get user data
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })
    
    // Return notification preferences or default values
    return NextResponse.json({
      emailNotifications: user.emailNotifications || {
        account: true,
        marketing: false,
        courses: true,
        achievements: true,
        comments: false,
        newsletter: true,
      },
      pushNotifications: user.pushNotifications || {
        account: true,
        marketing: false,
        courses: true,
        achievements: true,
        comments: true,
        newsletter: false,
      },
      notificationFrequency: user.notificationFrequency || 'immediately',
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    )
  }
}

/**
 * Update user notification preferences
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // Get request body
    const { emailNotifications, pushNotifications, notificationFrequency } = await request.json()
    
    // Get Payload client
    const payload = await getPayloadClient()
    
    // Update user data
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        emailNotifications,
        pushNotifications,
        notificationFrequency,
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}
