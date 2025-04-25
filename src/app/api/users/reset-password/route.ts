import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

/**
 * Handler for password reset requests
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Find the user by reset token
    const users = await payload.find({
      collection: 'users',
      where: {
        resetPasswordToken: {
          equals: token,
        },
      },
    })

    if (!users.docs.length) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const user = users.docs[0]

    // Check if token is expired
    const now = new Date()
    const expiration = new Date(user.resetPasswordExpiration)
    
    if (now > expiration) {
      return NextResponse.json(
        { message: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Update the user's password and clear the reset token
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password,
        resetPasswordToken: null,
        resetPasswordExpiration: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in reset password:', error)
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
