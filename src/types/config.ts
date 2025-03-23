import type { CollectionConfig } from 'payload'
import type { Plugin } from 'payload'

export interface PayloadConfig {
  collections: CollectionConfig[]
  plugins: Plugin[]
  serverURL: string
  typescript: {
    outputFile: string
  }
}

export interface DatabaseConfig {
  url: string
  connectOptions: {
    directConnection: boolean
    serverSelectionTimeoutMS: number
    connectTimeoutMS: number
    socketTimeoutMS: number
    retryWrites: boolean
    retryReads: boolean
    w: string
    maxPoolSize: number
    minPoolSize: number
  }
}