import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/lib/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define the notification preference types based on your UserPreferences interface
interface EmailNotifications {
  account: boolean
  marketing: boolean
  courses: boolean
  achievements: boolean
  comments: boolean
  newsletter: boolean
}

interface PushNotifications {
  account: boolean
  marketing: boolean
  courses: boolean
  achievements: boolean
  comments: boolean
  newsletter: boolean
}

// Extend the User type with notification preferences
interface User {
  id: string
  emailNotifications?: EmailNotifications
  pushNotifications?: PushNotifications
  notificationFrequency?: 'immediately' | 'daily' | 'weekly' | 'never'
}

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
    }) as User
    
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
    logError('Error fetching notification preferences:', error)
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
    logError('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}
