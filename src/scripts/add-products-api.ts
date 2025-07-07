#!/usr/bin/env node

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import type { Product, ProductType } from '../types/product'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Initialize dotenv with proper path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../../.env')
config({ path: envPath })

const testProducts: Partial<Product>[] = [
  {
    title: {
      en: 'Advanced N8N Automation Bundle',
      ru: 'Продвинутый набор автоматизации N8N'
    },
    productType: 'digital' as ProductType,
    category: 'n8n',
    price: 99.99,
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'Complete set of advanced N8N workflows for business automation'
              }
            ]
          }
        ],
        direction: 'ltr',
        format: 'left',
        indent: 0,
        version: 1
      }
    },
    shortDescription: 'Advanced N8N workflows bundle for business process automation',
    features: [
      {
        name: 'Workflow Templates',
        value: '20+ ready-to-use automation templates'
      },
      {
        name: 'Integration Nodes',
        value: 'Custom nodes for popular services'
      },
      {
        name: 'Documentation',
        value: 'Detailed setup and usage guides'
      }
    ],
    fileDetails: {
      key: 'n8n-bundle-v1.zip',
      size: 15000000, // 15MB
      mimeType: 'application/zip',
      version: 1
    },
    downloadSettings: {
      maxDownloads: 3,
      accessDuration: 30 // 30 days
    },
    version: {
      number: '1.0.0',
      releaseNotes: 'Initial release with 20+ workflow templates'
    },
    demoUrl: 'https://demo.example.com/n8n-bundle',
    status: 'published'
  },
  {
    title: {
      en: 'Make.com Enterprise Workflows',
      ru: 'Корпоративные рабочие процессы Make.com'
    },
    productType: 'digital' as ProductType,
    category: 'make',
    price: 149.99,
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'Enterprise-grade Make.com workflow collection for large-scale automation'
              }
            ]
          }
        ],
        direction: 'ltr',
        format: 'left',
        indent: 0,
        version: 1
      }
    },
    shortDescription: 'Enterprise Make.com workflows for complex business processes',
    features: [
      {
        name: 'Enterprise Templates',
        value: '15 enterprise-grade workflows'
      },
      {
        name: 'Performance Optimized',
        value: 'Optimized for high-volume processing'
      },
      {
        name: 'Support Package',
        value: '30 days implementation support'
      }
    ],
    fileDetails: {
      key: 'make-enterprise-v1.zip',
      size: 20000000, // 20MB
      mimeType: 'application/zip',
      version: 1
    },
    downloadSettings: {
      maxDownloads: 5,
      accessDuration: 60 // 60 days
    },
    version: {
      number: '1.0.0',
      releaseNotes: 'Initial enterprise package release'
    },
    demoUrl: 'https://demo.example.com/make-enterprise',
    status: 'published'
  }
]

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const API_URL = `${baseUrl}/api/products`

  logDebug('\n🚀 Starting product import process...')
  logDebug(`📡 API URL: ${API_URL}`)
  logDebug(`🔑 Using PAYLOAD_SECRET: ${process.env.PAYLOAD_SECRET?.substring(0, 8)}...`)

  let successCount = 0
  let failureCount = 0

  for (const product of testProducts) {
    try {
      // Health check
      const healthCheck = await fetch(`${baseUrl}/api/health`)
      if (!healthCheck.ok) {
        throw new Error('API health check failed - server might be down')
      }

      logDebug(`\n📦 Processing product: ${product.title.en}`)
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PAYLOAD_SECRET, // Changed to x-api-key header
        },
        body: JSON.stringify(product)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(responseData)}`)
      }

      logDebug(`✅ Successfully added product: ${product.title.en}`)
      logDebug('   ID:', responseData.id)
      successCount++

    } catch (error) {
      logError(`❌ Error adding ${product.title.en}:`)
      if (error instanceof Error) {
        logError('   Error details:', error.message)
      }
      failureCount++
    }
  }

  // Print summary
  logDebug('\n📊 Import Summary:')
  logDebug(`   ✅ Successful imports: ${successCount}`)
  logDebug(`   ❌ Failed imports: ${failureCount}`)
  logDebug(`   📈 Success rate: ${((successCount / testProducts.length) * 100).toFixed(1)}%\n`)
}

// Run the script
main().catch(error => {
  logError('💥 Fatal error:', error)
  process.exit(1)
}).finally(() => {
  logDebug('👋 Import process completed')
  process.exit(0)
})
