// Custom ESM loader to handle CSS and other non-JavaScript files
export async function resolve(specifier, context, nextResolve) {
  // Skip handling for CSS, SCSS, and other style files
  if (specifier.endsWith('.css') || specifier.endsWith('.scss') || specifier.endsWith('.sass')) {
    return {
      shortCircuit: true,
      url: 'data:text/javascript,export default {};',
    }
  }

  // Let Node.js handle all other files
  return nextResolve(specifier, context)
}
