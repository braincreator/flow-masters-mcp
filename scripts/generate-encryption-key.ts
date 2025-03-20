#!/usr/bin/env node

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

function generateAndSaveKey() {
  // Generate a random 32-byte (256-bit) key
  const key = crypto.randomBytes(32).toString('hex')
  
  const envPath = path.join(process.cwd(), '.env')
  
  try {
    // Read current .env content
    let currentEnv = ''
    try {
      currentEnv = fs.readFileSync(envPath, 'utf-8')
    } catch (error) {
      // File doesn't exist, create it
      currentEnv = ''
    }
    
    // Check if ENCRYPTION_KEY already exists
    if (currentEnv.includes('ENCRYPTION_KEY=')) {
      // Replace existing key
      const newEnv = currentEnv.replace(
        /ENCRYPTION_KEY=.*/,
        `ENCRYPTION_KEY=${key}`
      )
      fs.writeFileSync(envPath, newEnv)
    } else {
      // Append new key
      const newLine = currentEnv.length > 0 && !currentEnv.endsWith('\n') ? '\n' : ''
      fs.writeFileSync(envPath, `${currentEnv}${newLine}ENCRYPTION_KEY=${key}`)
    }
    
    console.log('✅ Encryption key generated and saved to .env')
    console.log(`Key: ${key}`)
  } catch (error) {
    console.error('Error updating .env file:', error)
    process.exit(1)
  }
}

generateAndSaveKey()
