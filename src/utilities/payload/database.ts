import mongoose from 'mongoose'

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
    timeoutPromise
  ])
}

export { enhanceMongooseConnection }
