#!/usr/bin/env node

/**
 * Script to clean up unused dependencies and add missing ones
 * Usage: node scripts/cleanup-dependencies.mjs
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

// Dependencies that are actually unused and can be safely removed
const SAFE_TO_REMOVE = [
  '@ai-sdk/openai', // Not used in current implementation
  '@formatjs/intl-localematcher', // Next-intl handles this
  '@google-cloud/aiplatform', // Not used
  '@google-cloud/storage', // Not used
  '@google-cloud/translate', // Not used
  '@nouance/payload-better-fields-plugin', // Not used
  '@payload-enchants/better-localized-fields', // Not used
  '@payload-enchants/translator', // Not used
  'critters', // Deprecated
  'sonic-boom', // Not used
  'undici', // Node.js built-in fetch is used
  'use-debounce', // lodash.debounce is used instead
  'zustand', // Not used in current implementation
]

// Dev dependencies that can be removed
const DEV_SAFE_TO_REMOVE = [
  '@fullhuman/postcss-purgecss', // Not used
  'browser-process-hrtime', // Not needed
  'browserify-zlib', // Not needed
  'buffer-from', // Not needed
  'cross-fetch', // Native fetch is used
  'cssnano', // CSS minimizer plugin is used instead
  'mini-css-extract-plugin', // Next.js handles this
  'node-fetch', // Native fetch is used
  'style-loader', // Next.js handles this
]

// Dependencies that should be added
const MISSING_DEPENDENCIES = [
  'mongodb', // Required for Payload CMS
  'express', // Required for Payload CMS
  'slate', // Required for rich text editor
  'jsdom', // Required for HTML parsing
  'bson', // Required for MongoDB
  'mongoose', // Required for Payload CMS
  'axios', // Used in API client
  '@tanstack/react-query', // Used for data fetching
  '@heroicons/react', // Used for icons
  'react-joyride', // Used for onboarding
  '@testing-library/react', // Required for tests
  'prismjs', // Used for code highlighting
  'embla-carousel-autoplay', // Used in carousel
  'react-hotkeys-hook', // Used for keyboard shortcuts
]

function readPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json')
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'))
}

function writePackageJson(packageData) {
  const packagePath = path.join(process.cwd(), 'package.json')
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n')
}

function removeDependencies(packageData, deps, type = 'dependencies') {
  let removed = 0
  for (const dep of deps) {
    if (packageData[type] && packageData[type][dep]) {
      delete packageData[type][dep]
      removed++
      console.log(`✅ Removed ${type}: ${dep}`)
    }
  }
  return removed
}

function installMissingDependencies() {
  console.log('\n📦 Installing missing dependencies...')
  
  try {
    // Install missing dependencies
    const depsToInstall = MISSING_DEPENDENCIES.filter(dep => {
      // Check if already installed
      try {
        execSync(`npm list ${dep}`, { stdio: 'ignore' })
        return false // Already installed
      } catch {
        return true // Not installed
      }
    })
    
    if (depsToInstall.length > 0) {
      console.log(`Installing: ${depsToInstall.join(', ')}`)
      execSync(`npm install ${depsToInstall.join(' ')}`, { stdio: 'inherit' })
    } else {
      console.log('All required dependencies are already installed')
    }
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message)
  }
}

function main() {
  console.log('🧹 Starting dependency cleanup...\n')
  
  const packageData = readPackageJson()
  let totalRemoved = 0
  
  // Remove unused dependencies
  console.log('🗑️  Removing unused dependencies...')
  totalRemoved += removeDependencies(packageData, SAFE_TO_REMOVE, 'dependencies')
  
  console.log('\n🗑️  Removing unused dev dependencies...')
  totalRemoved += removeDependencies(packageData, DEV_SAFE_TO_REMOVE, 'devDependencies')
  
  // Write updated package.json
  if (totalRemoved > 0) {
    writePackageJson(packageData)
    console.log(`\n✅ Removed ${totalRemoved} unused dependencies`)
    
    // Clean node_modules
    console.log('\n🧹 Cleaning node_modules...')
    try {
      execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' })
      console.log('✅ Cleaned node_modules')
    } catch (error) {
      console.error('❌ Error cleaning node_modules:', error.message)
    }
    
    // Reinstall dependencies
    console.log('\n📦 Reinstalling dependencies...')
    try {
      execSync('npm install', { stdio: 'inherit' })
      console.log('✅ Dependencies reinstalled')
    } catch (error) {
      console.error('❌ Error reinstalling dependencies:', error.message)
    }
  } else {
    console.log('\n✅ No unused dependencies found')
  }
  
  // Install missing dependencies
  installMissingDependencies()
  
  console.log('\n🎉 Dependency cleanup completed!')
  console.log('\n📊 Summary:')
  console.log(`- Removed: ${totalRemoved} unused dependencies`)
  console.log(`- Added: ${MISSING_DEPENDENCIES.length} missing dependencies`)
  
  console.log('\n💡 Next steps:')
  console.log('1. Run `npm run build` to test the build')
  console.log('2. Run `npm run analyze` to check bundle size')
  console.log('3. Test the application to ensure everything works')
}

// Run the script
main()
