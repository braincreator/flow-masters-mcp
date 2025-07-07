#!/usr/bin/env node

/**
 * Скрипт для исправления ВСЕХ оставшихся API путей /api/ на /api/
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

function getAllFilesWithApiV1() {
  try {
    // Находим все файлы с /api/, исключая редиректы
    const output = execSync(
      'grep -r "/api/" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=".migration-backup" | grep -v "src/app/api/" | cut -d: -f1 | sort | uniq',
      { encoding: 'utf8' }
    )
    
    return output.trim().split('\n').filter(line => line.length > 0)
  } catch (error) {
    console.error('Error finding files:', error.message)
    return []
  }
}

function fixApiPaths(filePath) {
  try {
    console.log(`🔧 Fixing ${filePath}...`)
    
    let content = fs.readFileSync(filePath, 'utf8')
    let changeCount = 0
    
    // Заменяем все /api/ на /api/
    const originalContent = content
    content = content.replace(/\/api\/v1\//g, '/api/')
    
    // Подсчитываем количество изменений
    const matches = originalContent.match(/\/api\/v1\//g)
    changeCount = matches ? matches.length : 0
    
    if (changeCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ Fixed ${changeCount} API paths in ${filePath}`)
    } else {
      console.log(`ℹ️  No API paths to fix in ${filePath}`)
    }
    
    return changeCount
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message)
    return 0
  }
}

function main() {
  console.log('🚀 Finding and fixing ALL remaining API paths...\n')
  
  const filesToFix = getAllFilesWithApiV1()
  
  if (filesToFix.length === 0) {
    console.log('🎉 No files with /api/ paths found!')
    return
  }
  
  console.log(`📁 Found ${filesToFix.length} files to fix:\n`)
  filesToFix.forEach(file => console.log(`   - ${file}`))
  console.log('')
  
  let totalChanges = 0
  
  for (const filePath of filesToFix) {
    const fullPath = path.resolve(filePath)
    
    if (fs.existsSync(fullPath)) {
      totalChanges += fixApiPaths(fullPath)
    } else {
      console.log(`⚠️  File not found: ${filePath}`)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Files processed: ${filesToFix.length}`)
  console.log(`   Total changes: ${totalChanges}`)
  
  if (totalChanges > 0) {
    console.log('\n🎉 All API paths have been fixed!')
    console.log('💡 Remember to test the application after these changes.')
  } else {
    console.log('\nℹ️  No changes were needed.')
  }
}

main()
