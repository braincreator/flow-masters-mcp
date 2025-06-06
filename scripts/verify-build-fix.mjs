#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

console.log('🔍 Verifying build fix...')

// Check if the problematic file has been fixed
const myCoursesPath = 'src/app/(frontend)/[lang]/account/my-courses/page.tsx'

if (fs.existsSync(myCoursesPath)) {
  const content = fs.readFileSync(myCoursesPath, 'utf8')
  
  console.log('✅ my-courses/page.tsx exists')
  
  // Check if it's a server component (no 'use client')
  if (!content.includes("'use client'")) {
    console.log('✅ File is now a server component')
  } else {
    console.log('❌ File still has "use client" directive')
  }
  
  // Check if it doesn't import getPayloadHMR
  if (!content.includes('getPayloadHMR')) {
    console.log('✅ File no longer imports getPayloadHMR')
  } else {
    console.log('❌ File still imports getPayloadHMR')
  }
  
  // Check if it doesn't use useEffect
  if (!content.includes('useEffect')) {
    console.log('✅ File no longer uses useEffect')
  } else {
    console.log('❌ File still uses useEffect')
  }
  
} else {
  console.log('❌ my-courses/page.tsx not found')
}

// Check Services collection configuration
const servicesConfigPath = 'src/collections/Services/index.ts'

if (fs.existsSync(servicesConfigPath)) {
  const content = fs.readFileSync(servicesConfigPath, 'utf8')
  
  console.log('\n📋 Checking Services collection configuration...')
  
  // Check defaultColumns
  if (content.includes("defaultColumns: ['title', 'serviceType', 'price', 'status', 'publishedAt']")) {
    console.log('✅ defaultColumns includes price field')
  } else {
    console.log('❌ defaultColumns missing price field')
  }
  
  // Check preview URL
  if (content.includes("formatPreviewURL('services', doc, locale)")) {
    console.log('✅ Preview URL uses services collection')
  } else {
    console.log('❌ Preview URL not updated')
  }
  
} else {
  console.log('❌ Services collection config not found')
}

// Check formatPreviewURL utility
const formatPreviewPath = 'src/utilities/formatPreviewURL.ts'

if (fs.existsSync(formatPreviewPath)) {
  const content = fs.readFileSync(formatPreviewPath, 'utf8')
  
  console.log('\n🔧 Checking formatPreviewURL utility...')
  
  // Check if services is supported
  if (content.includes("'services'") && content.includes("case 'services':")) {
    console.log('✅ formatPreviewURL supports services collection')
  } else {
    console.log('❌ formatPreviewURL missing services support')
  }
  
} else {
  console.log('❌ formatPreviewURL utility not found')
}

// Check generatePreviewPath utility
const generatePreviewPath = 'src/utilities/generatePreviewPath.ts'

if (fs.existsSync(generatePreviewPath)) {
  const content = fs.readFileSync(generatePreviewPath, 'utf8')
  
  console.log('\n🔧 Checking generatePreviewPath utility...')
  
  // Check if services is supported
  if (content.includes("'services'")) {
    console.log('✅ generatePreviewPath supports services collection')
  } else {
    console.log('❌ generatePreviewPath missing services support')
  }
  
} else {
  console.log('❌ generatePreviewPath utility not found')
}

console.log('\n🎉 Build fix verification completed!')
console.log('\n💡 Next steps:')
console.log('1. Run: npm run build (or pnpm build)')
console.log('2. Run: npm run dev (or pnpm dev)')
console.log('3. Check admin panel at http://localhost:3000/admin')
console.log('4. Look for Services in E-commerce section')
