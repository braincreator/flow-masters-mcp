#!/usr/bin/env node

/**
 * Скрипт для исправления оставшихся API путей /api/ на /api/
 */

import fs from 'fs'
import path from 'path'

const filesToFix = [
  'src/app/(admin)/admin/course-creator/page.tsx',
  'src/app/(admin)/admin/landing-generator/page.tsx',
  'src/app/(admin)/admin/setup-rewards/page.tsx'
]

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
  console.log('🚀 Fixing remaining API paths...\n')
  
  let totalChanges = 0
  
  for (const filePath of filesToFix) {
    const fullPath = path.resolve(filePath)
    
    if (fs.existsSync(fullPath)) {
      totalChanges += fixApiPaths(fullPath)
    } else {
      console.log(`⚠️  File not found: ${filePath}`)
    }
  }
  
  console.log(`\n📊 Total changes: ${totalChanges}`)
  
  if (totalChanges > 0) {
    console.log('🎉 All API paths have been fixed!')
  } else {
    console.log('ℹ️  No changes were needed.')
  }
}

main()
