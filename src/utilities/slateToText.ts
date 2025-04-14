import { type Node } from 'slate'

// Basic implementation to extract text from Slate nodes.
// This might need adjustments based on your specific Slate configuration (custom elements, etc.)
const serializeSlateToText = (nodes: Node[] | undefined | null): string => {
  if (!nodes) {
    return ''
  }
  return nodes
    .map((node) => {
      if (node.text) {
        return node.text
      }
      if (node.children) {
        // Recursively serialize children
        return serializeSlateToText(node.children as Node[])
      }
      // Handle other node types if necessary (e.g., line breaks)
      // For basic word count, we might want to add spaces between block elements
      if (node.type && node.type !== 'inline') {
        return ' \n' // Add space/newline for block elements
      }
      return ''
    })
    .join('')
}

export default serializeSlateToText
