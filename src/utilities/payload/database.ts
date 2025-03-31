import mongoose from 'mongoose'

// Check database connection and provide diagnostic information
export const checkDatabaseConnection = async (): Promise<{
  status: 'connected' | 'disconnected' | 'connecting' | 'disconnecting' | 'unknown'
  details: string
  isConnected: boolean
}> => {
  try {
    const dbState = mongoose.connection.readyState
    const dbStatuses: Record<
      number,
      'connected' | 'disconnected' | 'connecting' | 'disconnecting' | 'unknown'
    > = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }

    const status = dbStatuses[dbState] || 'unknown'
    let details = `MongoDB connection state: ${dbState}`

    // Additional details if connected
    if (dbState === 1) {
      try {
        const db = mongoose.connection.db
        details += `. Database: ${db.databaseName}`

        // Get collection names
        const collections = await db.listCollections().toArray()
        details += `. Collections: ${collections.map((c) => c.name).join(', ')}`
      } catch (err) {
        details += `. Error getting database details: ${String(err)}`
      }
    }

    // Connection URI details (redacted for security)
    const uri = process.env.DATABASE_URI || 'Not set'
    const redactedUri = uri.replace(/:\/\/[^@]*@/, '://***:***@')
    details += `. Connection URI: ${redactedUri}`

    return {
      status,
      details,
      isConnected: dbState === 1,
    }
  } catch (error) {
    return {
      status: 'unknown',
      details: `Error checking connection: ${String(error)}`,
      isConnected: false,
    }
  }
}

const enhanceMongooseConnection = () => {
  // Add connection event handlers
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err)
    // Implement reconnection logic
    setTimeout(() => {
      console.log('Attempting to reconnect to MongoDB...')
      mongoose.connect(process.env.DATABASE_URI!)
    }, 5000)
  })

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...')
    setTimeout(() => {
      mongoose.connect(process.env.DATABASE_URI!)
    }, 5000)
  })

  mongoose.connection.on('connected', () => {
    console.log('Successfully connected to MongoDB')
  })

  // Add connection timeout handling
  const timeoutMs = 30000
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('MongoDB connection timeout')), timeoutMs)
  })

  return Promise.race([
    mongoose.connect(process.env.DATABASE_URI!, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 1,
    }),
    timeoutPromise,
  ])
}

export { enhanceMongooseConnection }
