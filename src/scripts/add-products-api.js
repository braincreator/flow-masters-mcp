import FormData from 'form-data'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Immediate console log to verify script execution
logDebug('Script starting...')

// Initialize dotenv
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../../.env')
logDebug('Loading environment from:', envPath)
dotenv.config({ path: envPath })

// Log environment state
logDebug('Environment loaded:', {
  // NODE_ENV: process.env.NODE_ENV,
  SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  HAS_API_KEY: Boolean(process.env.PAYLOAD_SECRET),
})

const testProducts = [
  {
    title: {
      en: 'Test Product 1',
      ru: 'Тестовый продукт 1'
    },
    description: {
      en: 'This is a test product with full automation features',
      ru: 'Это тестовый продукт с полным набором функций автоматизации'
    },
    price: 99.99,
    slug: 'test-product-1',
    category: 'automation',
    status: 'published'
  }
]

async function addProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const API_URL = `${baseUrl}/api/v1/products`
  
  logDebug('\n🚀 Starting product import process...')
  logDebug(`📡 API URL: ${API_URL}`)
  logDebug(`🔑 API Key present: ${Boolean(process.env.PAYLOAD_SECRET)}\n`)
  
  let successCount = 0
  let failureCount = 0
  const startTime = Date.now()

  for (const product of testProducts) {
    logDebug(`\n📦 Processing product: ${product.title.en}`)
    logDebug('   Slug:', product.slug)
    logDebug('   Price:', product.price)
    
    try {
      const form = new FormData()
      form.append('data', JSON.stringify(product))
      
      logDebug('   🔄 Sending request...')
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.PAYLOAD_SECRET || '',
        },
        body: form,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`)
      }

      logDebug('   ✅ Product added successfully')
      successCount++
      
    } catch (error) {
      logError(`   ❌ Error processing ${product.title.en}:`)
      logError('   ', error.message || String(error))
      failureCount++
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  
  logDebug('\n📊 Import Summary:')
  logDebug('   ✅ Successful imports:', successCount)
  logDebug('   ❌ Failed imports:', failureCount)
  logDebug('   ⏱️  Duration:', duration, 'seconds')
  logDebug('   📈 Success rate:', ((successCount / testProducts.length) * 100).toFixed(1) + '%\n')
}

// Add immediate invocation check logging
logDebug('Checking if script is being run directly...')
logDebug('import.meta.url:', import.meta.url)
logDebug('fileURLToPath result:', fileURLToPath(import.meta.url))

if (import.meta.url === fileURLToPath(import.meta.url)) {
  logDebug('Script is being run directly, executing addProducts()...')
  
  logDebug('🔍 Environment Check:')
  logDebug('   NODE_ENV:', process.env.NODE_ENV)
  logDebug('   Server URL:', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000')
  
  addProducts()
    .catch(error => {
      logError('\n💥 Fatal error:', error)
      process.exit(1)
    })
    .finally(() => {
      logDebug('👋 Import process completed')
      process.exit(0)
    })
} else {
  logDebug('Script is being imported as a module')
}

export { addProducts }
