#!/usr/bin/env node

/**
 * Test script to verify email configuration in production
 * This script tests both the environment variables and actual SMTP connection
 */

const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.production
dotenv.config({ path: path.resolve(__dirname, '../../.env.production') })

async function testEmailConfiguration() {
  console.log('🔍 Testing Production Email Configuration...\n')

  // 1. Check environment variables
  console.log('📋 Environment Variables Check:')
  const requiredVars = [
    'PAYLOAD_SMTP_HOST',
    'PAYLOAD_SMTP_PORT', 
    'PAYLOAD_SMTP_USER',
    'PAYLOAD_SMTP_PASSWORD',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER', 
    'SMTP_PASSWORD'
  ]

  let missingVars = []
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (!value || value.includes('your-') || value.includes('placeholder')) {
      console.log(`❌ ${varName}: ${value || 'NOT SET'}`)
      missingVars.push(varName)
    } else {
      // Mask password for security
      const displayValue = varName.includes('PASSWORD') ? '***MASKED***' : value
      console.log(`✅ ${varName}: ${displayValue}`)
    }
  })

  if (missingVars.length > 0) {
    console.log(`\n❌ Missing or invalid environment variables: ${missingVars.join(', ')}`)
    console.log('Please update .env.production with correct values.')
    return false
  }

  console.log('\n✅ All environment variables are set correctly!\n')

  // 2. Test SMTP connection using Payload variables
  console.log('🔌 Testing SMTP Connection (Payload Config):')
  try {
    const payloadTransporter = nodemailer.createTransporter({
      host: process.env.PAYLOAD_SMTP_HOST,
      port: parseInt(process.env.PAYLOAD_SMTP_PORT || '465'),
      secure: parseInt(process.env.PAYLOAD_SMTP_PORT || '465') === 465,
      auth: {
        user: process.env.PAYLOAD_SMTP_USER,
        pass: process.env.PAYLOAD_SMTP_PASSWORD,
      },
    })

    await payloadTransporter.verify()
    console.log('✅ Payload SMTP connection successful!')
  } catch (error) {
    console.log('❌ Payload SMTP connection failed:', error.message)
    return false
  }

  // 3. Test SMTP connection using Email Service variables
  console.log('\n🔌 Testing SMTP Connection (Email Service Config):')
  try {
    const serviceTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await serviceTransporter.verify()
    console.log('✅ Email Service SMTP connection successful!')
  } catch (error) {
    console.log('❌ Email Service SMTP connection failed:', error.message)
    return false
  }

  // 4. Send a test email (optional)
  const shouldSendTest = process.argv.includes('--send-test')
  if (shouldSendTest) {
    console.log('\n📧 Sending test email...')
    try {
      const testTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      const testEmail = {
        from: process.env.EMAIL_FROM || 'admin@flow-masters.ru',
        to: 'ay.krasnodar@gmail.com', // Test email from memories
        subject: 'Production Email Test - Flow Masters',
        html: `
          <h2>✅ Email Configuration Test Successful</h2>
          <p>This email confirms that the production email configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
          <hr>
          <p><em>Flow Masters - AI Agency</em></p>
        `
      }

      const info = await testTransporter.sendMail(testEmail)
      console.log('✅ Test email sent successfully!')
      console.log(`📧 Message ID: ${info.messageId}`)
    } catch (error) {
      console.log('❌ Failed to send test email:', error.message)
      return false
    }
  }

  console.log('\n🎉 All email configuration tests passed!')
  console.log('\n💡 To send a test email, run: node test-production-email.js --send-test')
  return true
}

// Run the test
testEmailConfiguration()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
