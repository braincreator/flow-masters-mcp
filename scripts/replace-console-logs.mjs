#!/usr/bin/env node

/**
 * Script to replace console.log statements with centralized logging system
 * Usage: node scripts/replace-console-logs.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const SRC_DIR = path.join(__dirname, '../src')
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build']
const EXCLUDE_FILES = ['logger.ts', 'console-replacement.ts']

// Statistics
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleLogsReplaced: 0,
  errors: 0
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath)
  const ext = path.extname(filePath)
  
  // Check extension
  if (!EXTENSIONS.includes(ext)) return false
  
  // Check excluded files
  if (EXCLUDE_FILES.some(excluded => fileName.includes(excluded))) return false
  
  // Check excluded directories
  if (EXCLUDE_DIRS.some(excluded => filePath.includes(excluded))) return false
  
  return true
}

/**
 * Get all files recursively
 */
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir)
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry)) {
        getAllFiles(fullPath, files)
      }
    } else if (shouldProcessFile(fullPath)) {
      files.push(fullPath)
    }
  }
  
  return files
}

/**
 * Replace console.log patterns with logger calls
 */
function replaceConsoleLogs(content, filePath) {
  let modified = false
  let replacements = 0
  
  // Add logger import if not present and console.log is found
  const hasConsoleLog = /console\.(log|debug|info|warn|error)/.test(content)
  const hasLoggerImport = /import.*logger.*from.*['"]@\/utils\/logger['"]/.test(content) ||
                         /import.*\{.*log(Debug|Info|Warn|Error).*\}.*from.*['"]@\/utils\/logger['"]/.test(content)
  
  if (hasConsoleLog && !hasLoggerImport) {
    // Find the last import statement
    const importRegex = /^import.*from.*['"][^'"]*['"];?\s*$/gm
    const imports = content.match(importRegex)
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1]
      const lastImportIndex = content.lastIndexOf(lastImport)
      const insertIndex = lastImportIndex + lastImport.length
      
      const loggerImport = "\nimport { logDebug, logInfo, logWarn, logError } from '@/utils/logger'"
      content = content.slice(0, insertIndex) + loggerImport + content.slice(insertIndex)
      modified = true
    }
  }
  
  // Replace console.log patterns
  const patterns = [
    {
      // console.log('message', data)
      regex: /console\.log\s*\(\s*(['"`][^'"`]*['"`])\s*,\s*([^)]+)\s*\)/g,
      replacement: 'logDebug($1, $2)'
    },
    {
      // console.log('message')
      regex: /console\.log\s*\(\s*(['"`][^'"`]*['"`])\s*\)/g,
      replacement: 'logDebug($1)'
    },
    {
      // console.log(variable)
      regex: /console\.log\s*\(\s*([^'"`][^)]*)\s*\)/g,
      replacement: 'logDebug("Debug:", $1)'
    },
    {
      // console.error
      regex: /console\.error\s*\(/g,
      replacement: 'logError('
    },
    {
      // console.warn
      regex: /console\.warn\s*\(/g,
      replacement: 'logWarn('
    },
    {
      // console.info
      regex: /console\.info\s*\(/g,
      replacement: 'logInfo('
    },
    {
      // console.debug
      regex: /console\.debug\s*\(/g,
      replacement: 'logDebug('
    }
  ]
  
  for (const pattern of patterns) {
    const matches = content.match(pattern.regex)
    if (matches) {
      content = content.replace(pattern.regex, pattern.replacement)
      replacements += matches.length
      modified = true
    }
  }
  
  return { content, modified, replacements }
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++
    
    const content = fs.readFileSync(filePath, 'utf8')
    const result = replaceConsoleLogs(content, filePath)
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content, 'utf8')
      stats.filesModified++
      stats.consoleLogsReplaced += result.replacements
      
      const relativePath = path.relative(process.cwd(), filePath)
      console.log(`✅ Modified: ${relativePath} (${result.replacements} replacements)`)
    }
  } catch (error) {
    stats.errors++
    const relativePath = path.relative(process.cwd(), filePath)
    console.error(`❌ Error processing ${relativePath}:`, error.message)
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting console.log replacement...\n')
  
  const files = getAllFiles(SRC_DIR)
  console.log(`Found ${files.length} files to process\n`)
  
  for (const file of files) {
    processFile(file)
  }
  
  console.log('\n📊 Summary:')
  console.log(`Files processed: ${stats.filesProcessed}`)
  console.log(`Files modified: ${stats.filesModified}`)
  console.log(`Console.log statements replaced: ${stats.consoleLogsReplaced}`)
  console.log(`Errors: ${stats.errors}`)
  
  if (stats.errors === 0) {
    console.log('\n✅ All console.log statements have been replaced successfully!')
  } else {
    console.log('\n⚠️  Some errors occurred during processing. Please review the output above.')
  }
}

// Run the script
main()
