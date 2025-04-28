#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Path to the problematic file
const reactCropCssPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css')

// Function to fix the CSS import issue
function fixCssImport() {
  if (fs.existsSync(reactCropCssPath)) {
    console.log('Found ReactCrop.css, creating a temporary empty file...')

    // Rename the CSS file temporarily
    fs.renameSync(reactCropCssPath, `${reactCropCssPath}.bak`)

    // Create an empty CSS file
    fs.writeFileSync(reactCropCssPath, '/* Empty CSS file for type generation */')

    return true
  }
  return false
}

// Function to restore the original CSS file
function restoreCssFile() {
  const backupFile = `${reactCropCssPath}.bak`
  if (fs.existsSync(backupFile)) {
    console.log('Restoring original CSS file...')

    // Remove the temporary file
    fs.unlinkSync(reactCropCssPath)

    // Restore the original file
    fs.renameSync(backupFile, reactCropCssPath)
  }
}

// Main execution
try {
  console.log('Preparing for type generation...')

  // Fix the CSS import issue
  const needsRestore = fixCssImport()

  console.log('Generating Payload types...')

  // Run the type generation command directly
  execSync('npx payload generate:types', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-warnings',
    },
  })

  // Restore the original CSS file if needed
  if (needsRestore) {
    restoreCssFile()
  }

  console.log('Types generated successfully!')
} catch (error) {
  console.error('Error generating types:', error)

  // Make sure to restore the CSS file even if there's an error
  try {
    restoreCssFile()
  } catch (restoreError) {
    console.error('Error restoring CSS file:', restoreError)
  }

  process.exit(1)
}
