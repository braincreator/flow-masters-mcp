import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import mongoose from 'mongoose'
import { checkDatabaseConnection } from '@/utilities/payload/database'

export async function GET(request: NextRequest) {
  try {
    const results = {
      database: {
        status: 'unknown',
        details: '',
        collections: [] as string[],
        connectionInfo: {},
      },
      payload: {
        status: 'unknown',
        collections: [] as string[],
        details: '',
        errors: [] as string[],
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUri: process.env.DATABASE_URI ? 'Set' : 'Not set',
        payloadSecret: process.env.PAYLOAD_SECRET ? 'Set' : 'Not set',
        serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'Not set',
      },
      system: {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
      },
    }

    // Check MongoDB connection using our enhanced diagnostic function
    const dbConnection = await checkDatabaseConnection()
    results.database.status = dbConnection.status
    results.database.details = dbConnection.details

    // Additional database checks
    if (dbConnection.isConnected) {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray()
        results.database.collections = collections.map((c) => c.name)

        // Check if our needed collections exist
        const requiredCollections = ['categories', 'tags', 'posts']
        const missingCollections = requiredCollections.filter(
          (c) => !results.database.collections.includes(c),
        )

        if (missingCollections.length > 0) {
          results.database.details += ` Missing required collections: ${missingCollections.join(', ')}.`
        }
      } catch (collError) {
        results.database.details += ` Error listing collections: ${String(collError)}`
      }
    }

    // Check Payload CMS
    try {
      const payload = await getPayloadClient()
      results.payload.status = 'connected'

      // List all available collections
      const collections = Object.keys(payload.collections)
      results.payload.collections = collections

      // Test each required collection
      const collectionTests = ['categories', 'tags', 'posts'].map(async (collName) => {
        if (collections.includes(collName)) {
          try {
            const items = await payload.find({
              collection: collName,
              limit: 1,
            })
            return `${collName} collection is accessible. Found ${items.totalDocs} documents.`
          } catch (err) {
            const errorMsg = `Error querying ${collName} collection: ${String(err)}`
            results.payload.errors.push(errorMsg)
            return errorMsg
          }
        } else {
          const errorMsg = `Collection '${collName}' not registered in Payload.`
          results.payload.errors.push(errorMsg)
          return errorMsg
        }
      })

      const testResults = await Promise.all(collectionTests)
      results.payload.details = testResults.join(' ')
    } catch (payloadError) {
      results.payload.status = 'error'
      results.payload.details = `Error initializing Payload: ${String(payloadError)}`
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to check system health',
        details: String(error),
      },
      {
        status: 500,
      },
    )
  }
}
