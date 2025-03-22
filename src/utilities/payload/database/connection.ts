import mongoose from 'mongoose'
import { connectionMonitor } from '../monitoring'

const DEFAULT_CONFIG = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 1,
  w: 'majority',
}

class DatabaseConnection {
  private static instance: DatabaseConnection
  private isConnecting: boolean = false
  private reconnectAttempts: number = 0
  private readonly maxReconnectAttempts: number = 5
  private readonly reconnectInterval: number = 5000
  private connectionPromise: Promise<void> | null = null

  private constructor() {
    this.setupConnectionHandlers()
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  private setupConnectionHandlers(): void {
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error)
      connectionMonitor.recordError(error)
      this.handleConnectionError().catch(console.error)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
      connectionMonitor.recordDisconnection()
      if (!this.isConnecting) {
        this.handleConnectionError().catch(console.error)
      }
    })

    mongoose.connection.on('connected', () => {
      console.log('Successfully connected to MongoDB')
      connectionMonitor.recordConnection()
      this.reconnectAttempts = 0
      this.isConnecting = false
    })

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected')
      connectionMonitor.recordConnection()
      this.reconnectAttempts = 0
      this.isConnecting = false
    })
  }

  private async handleConnectionError(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Exiting...')
      process.exit(1)
    }

    if (!this.isConnecting) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      await new Promise(resolve => setTimeout(resolve, this.reconnectInterval))
      await this.connect()
    }
  }

  public async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    if (mongoose.connection.readyState === 1) {
      return
    }

    this.isConnecting = true
    const uri = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters'

    this.connectionPromise = (async () => {
      try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(uri, DEFAULT_CONFIG)
      } catch (error) {
        this.isConnecting = false
        console.error('Failed to connect to MongoDB:', error)
        connectionMonitor.recordError(error instanceof Error ? error : new Error(String(error)))
        throw error
      } finally {
        this.connectionPromise = null
      }
    })()

    return this.connectionPromise
  }

  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
      return
    }

    try {
      this.isConnecting = true
      await mongoose.disconnect()
      console.log('Disconnected from MongoDB')
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error)
      connectionMonitor.recordError(error instanceof Error ? error : new Error(String(error)))
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  public getConnectionStatus(): string {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
    return states[mongoose.connection.readyState]
  }
}

export const databaseConnection = DatabaseConnection.getInstance()
