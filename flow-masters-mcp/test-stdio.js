#!/usr/bin/env node

/**
 * Simple test for stdio MCP server
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🧪 Testing Flow Masters MCP Server (STDIO mode)')
console.log('================================================\n')

// Test configuration
const testConfig = {
  apiKey: 'test-api-key-12345',
  apiUrl: 'http://localhost:3000',
  basePath: '/api',
  apiVersion: 'v1'
}

// Start the MCP server in stdio mode
const mcpServer = spawn('node', [
  path.join(__dirname, 'dist/stdio.js'),
  '--stdio',
  `--api-key=${testConfig.apiKey}`,
  `--api-url=${testConfig.apiUrl}`,
  `--base-path=${testConfig.basePath}`,
  `--api-version=${testConfig.apiVersion}`
], {
  stdio: ['pipe', 'pipe', 'pipe']
})

let responseCount = 0
const expectedResponses = 3

// Handle server output
mcpServer.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n')
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line)
        responseCount++
        
        console.log(`📨 Response ${responseCount}:`)
        console.log(JSON.stringify(response, null, 2))
        console.log('')
        
        if (responseCount >= expectedResponses) {
          console.log('✅ All tests completed successfully!')
          mcpServer.kill()
          process.exit(0)
        }
      } catch (error) {
        console.log('📝 Raw output:', line)
      }
    }
  }
})

// Handle server errors
mcpServer.stderr.on('data', (data) => {
  console.error('❌ Server error:', data.toString())
})

// Handle server exit
mcpServer.on('close', (code) => {
  console.log(`🔚 MCP server exited with code ${code}`)
  if (code !== 0) {
    process.exit(1)
  }
})

// Send test messages
setTimeout(() => {
  console.log('📤 Sending initialize request...')
  mcpServer.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'Test Client',
        version: '1.0.0'
      }
    }
  }) + '\n')
}, 100)

setTimeout(() => {
  console.log('📤 Sending tools/list request...')
  mcpServer.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  }) + '\n')
}, 200)

setTimeout(() => {
  console.log('📤 Sending tools/call request...')
  mcpServer.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get_api_health',
      arguments: {}
    }
  }) + '\n')
}, 300)

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - killing server')
  mcpServer.kill()
  process.exit(1)
}, 10000)
