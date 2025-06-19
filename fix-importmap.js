import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const importMapPath = path.resolve(__dirname, 'src/app/(payload)/admin/importMap.js')

// Function to fix react-image-crop CSS import issues
async function fixReactImageCrop() {
  try {
    console.log('Checking react-image-crop CSS import issues...')

    // Create a JavaScript module from the CSS file
    const cssPath = path.resolve(__dirname, 'node_modules/react-image-crop/dist/ReactCrop.css')
    const cssJsPath = path.resolve(__dirname, 'node_modules/react-image-crop/dist/ReactCrop.css.js')
    const cssBackupPath = path.resolve(
      __dirname,
      'node_modules/react-image-crop/dist/ReactCrop.css.bak',
    )

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

      // Update the original CSS file to be a JS module
      fs.writeFileSync(cssPath, jsContent)
    }

    // Update package.json exports
    const packageJsonPath = path.resolve(__dirname, 'node_modules/react-image-crop/package.json')

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

      if (!packageJson.exports['./dist/ReactCrop.css.js']) {
        packageJson.exports['./dist/ReactCrop.css.js'] = './dist/ReactCrop.css.js'
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      }
    }

    // Update import statements in Payload UI files
    const filesToUpdate = [
      'node_modules/@payloadcms/ui/dist/elements/EditUpload/index.js',
      'node_modules/@payloadcms/ui/dist/elements/EditUpload/index.d.ts',
      'node_modules/@payloadcms/ui/dist/exports/client/index.js',
    ]

    for (const filePath of filesToUpdate) {
      const fullPath = path.resolve(__dirname, filePath)

      if (fs.existsSync(fullPath)) {
        // Create backup
        const backupPath = `${fullPath}.bak`
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(fullPath, backupPath)
        }

        let content = fs.readFileSync(fullPath, 'utf8')

        // Replace CSS imports with JS imports
        const originalContent = content

        // Only replace if not already replaced
        if (
          content.includes('react-image-crop/dist/ReactCrop.css') &&
          !content.includes('react-image-crop/dist/ReactCrop.css.js')
        ) {
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
        }

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content)
        }
      }
    }

    console.log('✅ react-image-crop CSS import issues fixed')
  } catch (error) {
    console.error('❌ Error fixing react-image-crop:', error)
  }
}

// Function to fix the importMap.js file
async function fixImportMap() {
  try {
    // Check if the file exists
    if (!fs.existsSync(importMapPath)) {
      console.log('importMap.js file not found. Nothing to do.')
      return
    }

    // Read the file content
    let content = fs.readFileSync(importMapPath, 'utf8')
    let modified = false

    // Fix 1: Check for problematic LexicalDiffComponent import
    const hasLexicalDiffComponent = content.includes('LexicalDiffComponent')
    if (hasLexicalDiffComponent) {
      // Remove LexicalDiffComponent import
      content = content.replace(
        /import \{ LexicalDiffComponent[^\}]+\} from ['"]@payloadcms\/richtext-lexical\/rsc['"];\n?/g,
        '',
      )

      // Remove element from importMap object
      content = content.replace(
        /"@payloadcms\/richtext-lexical\/rsc#LexicalDiffComponent":[^,]+,\n?/g,
        '',
      )

      modified = true
    }

    // Fix 2: Replace relative paths with absolute paths
    const hadRelativePaths = content.includes("from '../../../../")
    if (hadRelativePaths) {
      content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\//g, "from '@/")
      modified = true
    }

    // Fix 3: Replace import map keys
    const hadRelativeKeys = content.includes("'/components/admin/")
    if (hadRelativeKeys) {
      content = content.replace(/['"]\/components\/admin\//g, "'@/components/admin/")
      modified = true
    }

    // Write the fixed content
    if (modified) {
      fs.writeFileSync(importMapPath, content)
      console.log('✅ importMap.js successfully fixed')
    } else {
      console.log('importMap.js is already fixed or contains no issues.')
    }
  } catch (error) {
    console.error('❌ Error fixing importMap.js:', error)
  }
}

// Run the fix functions
async function runFixes() {
  await fixReactImageCrop()
  await fixImportMap()
}

runFixes()