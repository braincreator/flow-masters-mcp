#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Create a JavaScript module from the CSS file
const createCssJsModule = () => {
  const cssPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css')
  const cssJsPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css.js')
  const cssBackupPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css.bak')

  if (fs.existsSync(cssPath)) {
    // Backup original CSS file if not already backed up
    if (!fs.existsSync(cssBackupPath)) {
      fs.copyFileSync(cssPath, cssBackupPath)
    }

    // Read CSS content
    let cssContent = fs.readFileSync(cssPath, 'utf8')

    // If the CSS file is already converted to JS, read from backup
    if (cssContent.startsWith('//') || cssContent.startsWith('export')) {
      if (fs.existsSync(cssBackupPath)) {
        cssContent = fs.readFileSync(cssBackupPath, 'utf8')
      }
    }

    // Create JS module content
    const jsContent = `// CSS content exported as a JavaScript module for ESM compatibility
export default \`${cssContent.replace(/`/g, '\\`')}\`;`

    // Write the JS module
    fs.writeFileSync(cssJsPath, jsContent)
    console.log('Created ReactCrop.css.js module')

    // Update the original CSS file to be a JS module
    fs.writeFileSync(cssPath, jsContent)
    console.log('Updated ReactCrop.css to be a JS module')
  }
}

// Update package.json exports
const updatePackageExports = () => {
  const packageJsonPath = path.join(rootDir, 'node_modules/react-image-crop/package.json')

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    if (!packageJson.exports['./dist/ReactCrop.css.js']) {
      packageJson.exports['./dist/ReactCrop.css.js'] = './dist/ReactCrop.css.js'
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log('Updated package.json exports')
    }
  }
}

// Update import statements in Payload UI files
const updateImportStatements = () => {
  const filesToUpdate = [
    'node_modules/@payloadcms/ui/dist/elements/EditUpload/index.js',
    'node_modules/@payloadcms/ui/dist/elements/EditUpload/index.d.ts',
    'node_modules/@payloadcms/ui/dist/exports/client/index.js',
  ]

  for (const filePath of filesToUpdate) {
    const fullPath = path.join(rootDir, filePath)

    if (fs.existsSync(fullPath)) {
      // Create backup
      const backupPath = `${fullPath}.bak`
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(fullPath, backupPath)
      }

      let content = fs.readFileSync(fullPath, 'utf8')

      // Replace CSS imports with JS imports
      const originalContent = content
      content = content.replace(
        /import ['"]react-image-crop\/dist\/ReactCrop\.css['"];?/g,
        "import 'react-image-crop/dist/ReactCrop.css.js';",
      )

      // For minified files, use sed-like replacement
      if (filePath.includes('client/index.js')) {
        content = content.replace(
          /react-image-crop\/dist\/ReactCrop\.css/g,
          'react-image-crop/dist/ReactCrop.css.js',
        )
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content)
        console.log(`Updated imports in ${filePath}`)
      }
    }
  }
}

// Main function
const main = () => {
  console.log('Fixing react-image-crop CSS import issues for ESM compatibility...')

  try {
    createCssJsModule()
    updatePackageExports()
    updateImportStatements()

    console.log('✅ Successfully fixed react-image-crop CSS import issues!')
    console.log('You can now run: pnpm payload generate:importMap')
  } catch (error) {
    console.error('❌ Error fixing react-image-crop:', error.message)
    process.exit(1)
  }
}

main()
