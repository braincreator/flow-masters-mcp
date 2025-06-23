#!/usr/bin/env node

/**
 * Simple script to check email environment variables in production
 */

const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.production
dotenv.config({ path: path.resolve(__dirname, '../../.env.production') })

function checkEmailEnvironment() {
  console.log('🔍 Checking Production Email Environment Variables...\n')

  // Check environment variables
  console.log('📋 Environment Variables Check:')
  const requiredVars = [
    'PAYLOAD_SMTP_HOST',
    'PAYLOAD_SMTP_PORT', 
    'PAYLOAD_SMTP_USER',
    'PAYLOAD_SMTP_PASSWORD',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER', 
    'SMTP_PASSWORD',
    'EMAIL_FROM'
  ]

  let missingVars = []
  let hasPlaceholders = []
  
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (!value) {
      console.log(`❌ ${varName}: NOT SET`)
      missingVars.push(varName)
    } else if (value.includes('your-') || value.includes('placeholder')) {
      console.log(`⚠️  ${varName}: ${value} (PLACEHOLDER VALUE)`)
      hasPlaceholders.push(varName)
    } else {
      // Mask password for security
      const displayValue = varName.includes('PASSWORD') ? '***MASKED***' : value
      console.log(`✅ ${varName}: ${displayValue}`)
    }
  })

  console.log('\n📊 Summary:')
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing variables: ${missingVars.join(', ')}`)
  }
  
  if (hasPlaceholders.length > 0) {
    console.log(`⚠️  Placeholder variables: ${hasPlaceholders.join(', ')}`)
  }

  const totalIssues = missingVars.length + hasPlaceholders.length
  
  if (totalIssues === 0) {
    console.log('✅ All environment variables are set correctly!')
    console.log('\n🎯 Next steps:')
    console.log('1. Deploy the updated .env.production file')
    console.log('2. Restart the production server')
    console.log('3. Test email functionality')
    return true
  } else {
    console.log(`❌ Found ${totalIssues} issue(s) with email configuration`)
    console.log('\n🔧 To fix:')
    console.log('1. Update .env.production with correct SMTP credentials')
    console.log('2. Ensure PAYLOAD_SMTP_PASSWORD and SMTP_PASSWORD have the real password')
    console.log('3. Verify SMTP settings with your email provider')
    return false
  }
}

// Run the check
const success = checkEmailEnvironment()
process.exit(success ? 0 : 1)
