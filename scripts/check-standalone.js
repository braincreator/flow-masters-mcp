#!/usr/bin/env node

/**
 * Script to check if standalone build files are properly generated
 */

import fs from 'fs'
import path from 'path'

const requiredFiles = [
  '.next/standalone/server.js',
  '.next/standalone/package.json',
  '.next/static'
]

const optionalFiles = [
  '.next/standalone/node_modules',
  '.next/standalone/.next'
]

console.log('🔍 Checking standalone build files...\n')

let allRequired = true

// Check required files
for (const file of requiredFiles) {
  const exists = fs.existsSync(file)
  const status = exists ? '✅' : '❌'
  console.log(`${status} ${file}`)
  
  if (!exists) {
    allRequired = false
  }
}

console.log('\n📋 Optional files:')

// Check optional files
for (const file of optionalFiles) {
  const exists = fs.existsSync(file)
  const status = exists ? '✅' : '⚠️ '
  console.log(`${status} ${file}`)
}

// Check .next/static contents
if (fs.existsSync('.next/static')) {
  const staticFiles = fs.readdirSync('.next/static')
  console.log(`\n📁 Static files (${staticFiles.length}):`)
  staticFiles.slice(0, 5).forEach(file => {
    console.log(`   - ${file}`)
  })
  if (staticFiles.length > 5) {
    console.log(`   ... and ${staticFiles.length - 5} more`)
  }
}

console.log('\n' + '='.repeat(50))

if (allRequired) {
  console.log('✅ All required standalone files are present!')
  console.log('🐳 Ready for Docker deployment')
  process.exit(0)
} else {
  console.log('❌ Some required standalone files are missing!')
  console.log('💡 Make sure to run: npm run build:docker')
  console.log('💡 And check that output: "standalone" is enabled in next.config.mjs')
  process.exit(1)
}
