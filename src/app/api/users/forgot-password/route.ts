import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'
import crypto from 'crypto'

/**
 * Handler for forgot password requests
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Find the user by email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    // If no user found, still return success to prevent email enumeration
    if (!users.docs.length) {
      return NextResponse.json({ success: true })
    }

    const user = users.docs[0] as any // Type assertion to avoid TypeScript errors

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiration = new Date()
    resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1) // Token valid for 1 hour

    // Save the reset token to the user
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiration: resetTokenExpiration.toISOString(), // Convert to ISO string for Payload date field
      },
    })

    // Send the reset email
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const emailService = serviceRegistry.getEmailService()
    await emailService.sendPasswordResetEmail({
      email: user.email,
      name: user.name || '',
      locale: user.locale || 'ru',
      resetToken,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 },
    )
  }
}
