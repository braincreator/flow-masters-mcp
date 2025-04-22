// Custom ES module loader to handle CSS imports
import { URL, pathToFileURL } from 'url'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// Create a virtual module for CSS files
const virtualModulePath = path.join(process.cwd(), 'node_modules', '.virtual', 'css-empty.js')

// Ensure the directory exists
try {
  fs.mkdirSync(path.dirname(virtualModulePath), { recursive: true })
  // Create the virtual module file if it doesn't exist
  if (!fs.existsSync(virtualModulePath)) {
    fs.writeFileSync(virtualModulePath, 'export default {};\n')
  }
} catch (err) {
  console.error('Error creating virtual module:', err)
}

// Hook for resolving specifiers
export function resolve(specifier, context, nextResolve) {
  // Check if the specifier ends with .css
  if (specifier.endsWith('.css')) {
    // Return the path to our virtual module
    return {
      shortCircuit: true,
      url: pathToFileURL(virtualModulePath).href,
    }
  }

  // Let Node.js handle all other specifiers
  return nextResolve(specifier, context)
}
