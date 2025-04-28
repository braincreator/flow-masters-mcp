// Custom ES module loader to handle CSS imports
import { pathToFileURL } from 'url'

// Hook for resolving specifiers
export function resolve(specifier, context, nextResolve) {
  // Handle CSS, SCSS, and other style files
  if (
    specifier.endsWith('.css') ||
    specifier.includes('.css?') ||
    specifier.endsWith('.scss') ||
    specifier.includes('.scss?') ||
    specifier.endsWith('.sass') ||
    specifier.includes('.sass?')
  ) {
    return {
      shortCircuit: true,
      url: 'data:text/javascript;base64,ZXhwb3J0IGRlZmF1bHQge307', // Base64 encoded "export default {};"
    }
  }

  // Let Node.js handle all other specifiers
  return nextResolve(specifier, context)
}
