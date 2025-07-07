#!/usr/bin/env node

/**
 * Test script to verify blog API endpoints are working
 */

const http = require('http')
const https = require('https')

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    
    const req = protocol.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve({
            status: res.statusCode,
            data: parsed
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            error: 'Failed to parse JSON'
          })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function testBlogAPI() {
  console.log('🔍 Testing Blog API Endpoints...\n')

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  
  const endpoints = [
    {
      name: 'Blog Posts List',
      url: `${baseUrl}/api/blog/posts?limit=5&locale=en`
    },
    {
      name: 'Blog Posts List (Russian)',
      url: `${baseUrl}/api/blog/posts?limit=5&locale=ru`
    },
    {
      name: 'Blog Search',
      url: `${baseUrl}/api/blog/search?q=test`
    }
  ]

  for (const endpoint of endpoints) {
    console.log(`📡 Testing: ${endpoint.name}`)
    console.log(`🔗 URL: ${endpoint.url}`)
    
    try {
      const result = await makeRequest(endpoint.url)
      
      if (result.status === 200) {
        console.log(`✅ Success (${result.status})`)
        
        if (result.data && typeof result.data === 'object') {
          if (result.data.docs) {
            console.log(`📄 Found ${result.data.docs.length} posts`)
            if (result.data.docs.length > 0) {
              const firstPost = result.data.docs[0]
              console.log(`📝 First post: "${firstPost.title || 'No title'}"`)
            }
          } else if (result.data.results) {
            console.log(`🔍 Found ${result.data.results.length} search results`)
          } else {
            console.log(`📊 Response keys: ${Object.keys(result.data).join(', ')}`)
          }
        }
      } else if (result.status === 404) {
        console.log(`❌ Not Found (${result.status})`)
        if (result.data && result.data.error) {
          console.log(`💬 Error: ${result.data.error}`)
        }
      } else {
        console.log(`⚠️  Unexpected status (${result.status})`)
        if (result.data && result.data.error) {
          console.log(`💬 Error: ${result.data.error}`)
        }
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`)
    }
    
    console.log('') // Empty line for readability
  }

  console.log('🎯 Blog API test completed!')
  console.log('\n💡 If you see 404 errors, the endpoints might not be deployed yet.')
  console.log('💡 If you see connection errors, make sure the server is running.')
}

// Run the test
testBlogAPI()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  })
