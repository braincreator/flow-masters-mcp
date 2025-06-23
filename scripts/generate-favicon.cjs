#!/usr/bin/env node

/**
 * Script to generate favicon.ico from SVG
 * This script creates a simple favicon that matches the Flow Masters branding
 */

const fs = require('fs')
const path = require('path')

// Simple ICO file header and data for a 32x32 favicon
// This creates a basic favicon with "FM" text on a gradient background
const createFaviconICO = () => {
  console.log('🎨 Generating favicon.ico for Flow Masters...')
  
  // For now, we'll create a simple placeholder
  // In a real scenario, you'd use a library like 'sharp' or 'jimp' to convert SVG to ICO
  console.log('⚠️  Note: This is a placeholder favicon.ico file.')
  console.log('💡 For production, consider using an online converter or image editing tool')
  console.log('   to convert the favicon.svg to a proper favicon.ico file.')
  
  // Create a simple text file as placeholder
  const placeholderContent = `
Flow Masters Favicon Placeholder

To create a proper favicon.ico file:

1. Use an online converter like:
   - https://favicon.io/favicon-converter/
   - https://convertio.co/svg-ico/
   - https://cloudconvert.com/svg-to-ico

2. Upload the favicon.svg file from the public directory

3. Download the generated favicon.ico and replace this file

4. Or use a tool like ImageMagick:
   convert favicon.svg -resize 32x32 favicon.ico

The current favicon.svg contains:
- Flow Masters "FM" monogram
- Gradient background that adapts to light/dark themes
- Professional branding colors (blue, purple, cyan)
- Responsive design for different screen modes
`

  const faviconPath = path.resolve(__dirname, '../public/favicon.ico')
  
  // Read the existing favicon.ico to preserve it if it's already good
  if (fs.existsSync(faviconPath)) {
    console.log('✅ favicon.ico already exists')
    console.log('📁 Location:', faviconPath)
    
    // Check file size to see if it's the old one
    const stats = fs.statSync(faviconPath)
    console.log(`📊 Current size: ${stats.size} bytes`)
    
    if (stats.size > 1000) {
      console.log('✅ Favicon appears to be a proper ICO file')
      console.log('🎯 No changes needed - keeping existing favicon.ico')
      return
    }
  }
  
  // For now, just log instructions since we can't easily generate ICO files
  console.log('📝 Instructions saved to favicon-instructions.txt')
  fs.writeFileSync(
    path.resolve(__dirname, '../public/favicon-instructions.txt'),
    placeholderContent.trim()
  )
  
  console.log('\n🎯 Next steps:')
  console.log('1. The favicon.svg has been updated with Flow Masters branding')
  console.log('2. Modern browsers will use the SVG favicon automatically')
  console.log('3. For older browser support, convert favicon.svg to favicon.ico')
  console.log('4. The metadata configuration has been updated to prefer SVG')
  
  console.log('\n✅ Favicon setup completed!')
}

// Run the script
try {
  createFaviconICO()
} catch (error) {
  console.error('❌ Error generating favicon:', error)
  process.exit(1)
}
