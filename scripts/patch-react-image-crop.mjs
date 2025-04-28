#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Path to the file that imports the CSS
const reactCropCssJsPath = path.join(rootDir, 'node_modules/react-image-crop/dist/ReactCrop.css.js')

console.log('Patching react-image-crop module...')

if (fs.existsSync(reactCropCssJsPath)) {
  // Read the file
  let content = fs.readFileSync(reactCropCssJsPath, 'utf8')

  // Check if the file contains the CSS import
  if (content.includes("import css from './ReactCrop.css'")) {
    console.log('Found CSS import, creating backup and patching...')

    // Create a backup
    fs.writeFileSync(`${reactCropCssJsPath}.bak`, content)

    // Replace the file with a dummy module
    const dummyContent = `// This file is patched to avoid CSS import issues during type generation
export default '/* CSS content removed */';
`

    // Write the modified file
    fs.writeFileSync(reactCropCssJsPath, dummyContent)

    console.log('Successfully patched react-image-crop module')
  } else {
    console.log('CSS import not found or already patched')
  }
} else {
  console.error('react-image-crop module not found at expected path')
}
