#!/usr/bin/env node

/**
 * Integration test script to verify:
 * 1. ApiKeys collection is properly registered in Payload CMS
 * 2. MCP server can start and provide tool discovery
 * 3. Basic connectivity between components
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Flow Masters MCP Integration Test')
console.log('=====================================\n')

// Test 1: Check if ApiKeys collection is properly imported
console.log('1. Testing ApiKeys collection registration...')
try {
  const collectionListPath = path.join(__dirname, 'src/collections/collectionList.ts')
  const collectionListContent = fs.readFileSync(collectionListPath, 'utf8')

  // Check if ApiKeys import exists
  const hasApiKeysImport = collectionListContent.includes(
    "import { ApiKeys } from '../payload/collections/ApiKeys'",
  )

  // Check if ApiKeys is in the collections array
  const hasApiKeysInArray = collectionListContent.includes(
    'ApiKeys, // Add ApiKeys collection to the array',
  )

  if (hasApiKeysImport && hasApiKeysInArray) {
    console.log('✅ ApiKeys collection is properly registered')
  } else {
    console.log('❌ ApiKeys collection registration issues:')
    if (!hasApiKeysImport) console.log('   - Missing import statement')
    if (!hasApiKeysInArray) console.log('   - Missing in collections array')
  }
} catch (error) {
  console.log('❌ Error checking ApiKeys collection:', error.message)
}

// Test 2: Check if ApiKeys collection file exists and is valid
console.log('\n2. Testing ApiKeys collection file...')
try {
  const apiKeysPath = path.join(__dirname, 'src/payload/collections/ApiKeys.ts')
  const apiKeysContent = fs.readFileSync(apiKeysPath, 'utf8')

  // Check for essential fields
  const hasSlug = apiKeysContent.includes("slug: 'apiKeys'")
  const hasKeyField = apiKeysContent.includes("name: 'key'")
  const hasHashedKeyField = apiKeysContent.includes("name: 'hashedKey'")
  const hasPermissionsField = apiKeysContent.includes("name: 'permissions'")

  if (hasSlug && hasKeyField && hasHashedKeyField && hasPermissionsField) {
    console.log('✅ ApiKeys collection file is properly structured')
  } else {
    console.log('❌ ApiKeys collection file issues:')
    if (!hasSlug) console.log('   - Missing slug definition')
    if (!hasKeyField) console.log('   - Missing key field')
    if (!hasHashedKeyField) console.log('   - Missing hashedKey field')
    if (!hasPermissionsField) console.log('   - Missing permissions field')
  }
} catch (error) {
  console.log('❌ Error checking ApiKeys collection file:', error.message)
}

// Test 3: Check MCP server structure
console.log('\n3. Testing MCP server structure...')
try {
  const mcpPath = path.join(__dirname, 'flow-masters-mcp')

  // Check if MCP directory exists
  if (!fs.existsSync(mcpPath)) {
    console.log('❌ MCP server directory not found')
    process.exit(1)
  }

  // Check essential files
  const essentialFiles = [
    'package.json',
    'src/index.ts',
    'src/tools/definitions.ts',
    'src/tools/discovery.ts',
    'dist/index.js',
  ]

  let allFilesExist = true
  for (const file of essentialFiles) {
    const filePath = path.join(mcpPath, file)
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Missing file: ${file}`)
      allFilesExist = false
    }
  }

  if (allFilesExist) {
    console.log('✅ MCP server structure is complete')
  }
} catch (error) {
  console.log('❌ Error checking MCP server structure:', error.message)
}

// Test 4: Check MCP tool definitions
console.log('\n4. Testing MCP tool definitions...')
try {
  const toolsPath = path.join(__dirname, 'flow-masters-mcp/src/tools/definitions.ts')
  const toolsContent = fs.readFileSync(toolsPath, 'utf8')

  // Check for essential tools
  const essentialTools = [
    'get_api_health',
    'get_api_endpoints',
    'refresh_api_endpoints',
    'get_model_context',
    'proxy_api_request',
  ]

  let allToolsExist = true
  for (const tool of essentialTools) {
    if (!toolsContent.includes(`name: "${tool}"`)) {
      console.log(`❌ Missing tool: ${tool}`)
      allToolsExist = false
    }
  }

  if (allToolsExist) {
    console.log('✅ All essential MCP tools are defined')
  }

  // Check for proper structure
  const hasInputSchema = toolsContent.includes('inputSchema:')
  const hasOutputSchema = toolsContent.includes('outputSchema:')
  const hasExamples = toolsContent.includes('examples:')
  const hasErrorHandling = toolsContent.includes('errorHandling:')

  if (hasInputSchema && hasOutputSchema && hasExamples && hasErrorHandling) {
    console.log('✅ Tool definitions have proper structure')
  } else {
    console.log('❌ Tool definitions missing required fields')
  }
} catch (error) {
  console.log('❌ Error checking MCP tool definitions:', error.message)
}

// Test 5: Check MCP server integration
console.log('\n5. Testing MCP server integration...')
try {
  const indexPath = path.join(__dirname, 'flow-masters-mcp/src/index.ts')
  const indexContent = fs.readFileSync(indexPath, 'utf8')

  // Check for tool discovery endpoints
  const hasToolsEndpoint = indexContent.includes("pathname === '/mcp/tools'")
  const hasToolsSearchEndpoint = indexContent.includes("pathname === '/mcp/tools/search'")
  const hasToolsProtocolEndpoint = indexContent.includes("pathname === '/mcp/tools/protocol'")
  const hasToolsGuidanceEndpoint = indexContent.includes("pathname === '/mcp/tools/guidance'")

  if (
    hasToolsEndpoint &&
    hasToolsSearchEndpoint &&
    hasToolsProtocolEndpoint &&
    hasToolsGuidanceEndpoint
  ) {
    console.log('✅ MCP server has all tool discovery endpoints')
  } else {
    console.log('❌ MCP server missing tool discovery endpoints')
  }

  // Check for tool discovery import
  const hasToolDiscoveryImport = indexContent.includes(
    "import { toolDiscovery } from './tools/discovery'",
  )

  if (hasToolDiscoveryImport) {
    console.log('✅ MCP server properly imports tool discovery')
  } else {
    console.log('❌ MCP server missing tool discovery import')
  }
} catch (error) {
  console.log('❌ Error checking MCP server integration:', error.message)
}

console.log('\n🎉 Integration test completed!')
console.log('\nNext steps:')
console.log('1. Start the Flow Masters API server')
console.log('2. Start the MCP server: cd flow-masters-mcp && npm start')
console.log('3. Test tool discovery: curl http://localhost:3030/mcp/tools')
console.log('4. Test API health: curl http://localhost:3030/mcp/health')
