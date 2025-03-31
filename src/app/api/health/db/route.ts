import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { checkDatabaseConnection } from '@/utilities/payload/database'

export async function GET(request: NextRequest) {
  try {
    // First, check the current connection status
    const connectionStatus = await checkDatabaseConnection()

    // Attempt a direct MongoDB connection test
    let connectionTest = { success: false, message: 'Not attempted' }

    // If we're not already connected, try to connect directly
    if (!connectionStatus.isConnected) {
      try {
        const uri = process.env.DATABASE_URI

        if (!uri) {
          connectionTest.message = 'DATABASE_URI environment variable is not set'
        } else {
          // Try to establish a direct connection
          await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Shorter timeout for quick feedback
            connectTimeoutMS: 5000,
          })

          // If we reach here, connection was successful
          connectionTest = {
            success: true,
            message: 'Successfully connected to the database directly',
          }

          // Close this test connection to not interfere with the app's connection
          await mongoose.disconnect()
        }
      } catch (connError) {
        connectionTest = {
          success: false,
          message: `Failed to connect directly: ${String(connError)}`,
        }
      }
    } else {
      connectionTest = {
        success: true,
        message: 'Already connected to MongoDB',
      }
    }

    return NextResponse.json({
      connectionStatus,
      connectionTest,
      environmentVariables: {
        databaseUri: process.env.DATABASE_URI
          ? `Set (${process.env.DATABASE_URI.substring(0, 10)}...)`
          : 'Not set',
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to check database connection',
        details: String(error),
      },
      {
        status: 500,
      },
    )
  }
}
