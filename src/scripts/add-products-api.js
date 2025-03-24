import FormData from 'form-data'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Immediate console log to verify script execution
console.log('Script starting...')

// Initialize dotenv
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../../.env')
console.log('Loading environment from:', envPath)
dotenv.config({ path: envPath })

// Log environment state
console.log('Environment loaded:', {
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
  
  console.log('\n🚀 Starting product import process...')
  console.log(`📡 API URL: ${API_URL}`)
  console.log(`🔑 API Key present: ${Boolean(process.env.PAYLOAD_SECRET)}\n`)
  
  let successCount = 0
  let failureCount = 0
  const startTime = Date.now()

  for (const product of testProducts) {
    console.log(`\n📦 Processing product: ${product.title.en}`)
    console.log('   Slug:', product.slug)
    console.log('   Price:', product.price)
    
    try {
      const form = new FormData()
      form.append('data', JSON.stringify(product))
      
      console.log('   🔄 Sending request...')
      
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

      console.log('   ✅ Product added successfully')
      successCount++
      
    } catch (error) {
      console.error(`   ❌ Error processing ${product.title.en}:`)
      console.error('   ', error.message || String(error))
      failureCount++
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  
  console.log('\n📊 Import Summary:')
  console.log('   ✅ Successful imports:', successCount)
  console.log('   ❌ Failed imports:', failureCount)
  console.log('   ⏱️  Duration:', duration, 'seconds')
  console.log('   📈 Success rate:', ((successCount / testProducts.length) * 100).toFixed(1) + '%\n')
}

// Add immediate invocation check logging
console.log('Checking if script is being run directly...')
console.log('import.meta.url:', import.meta.url)
console.log('fileURLToPath result:', fileURLToPath(import.meta.url))

if (import.meta.url === fileURLToPath(import.meta.url)) {
  console.log('Script is being run directly, executing addProducts()...')
  
  console.log('🔍 Environment Check:')
  console.log('   NODE_ENV:', process.env.NODE_ENV)
  console.log('   Server URL:', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000')
  
  addProducts()
    .catch(error => {
      console.error('\n💥 Fatal error:', error)
      process.exit(1)
    })
    .finally(() => {
      console.log('👋 Import process completed')
      process.exit(0)
    })
} else {
  console.log('Script is being imported as a module')
}

export { addProducts }
