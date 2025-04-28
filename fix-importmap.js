import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const importMapPath = path.resolve(__dirname, 'src/app/(payload)/admin/importMap.js')

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

// Run the fix function
fixImportMap()
