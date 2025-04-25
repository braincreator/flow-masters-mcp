import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { normalizeLexicalContent, isLexicalContent } from './lexicalParser'

/**
 * Converts Lexical editor content to HTML for email templates
 * @param content Lexical content from Payload CMS
 * @returns HTML string representation
 */
export function lexicalToHtml(content: any): string {
  if (!content) return ''

  try {
    // Normalize the content to ensure consistent structure
    const normalizedContent = normalizeLexicalContent(content)
    
    // Process the root node
    if (!normalizedContent.root || !normalizedContent.root.children) {
      return ''
    }
    
    // Convert the content to HTML
    return processNodes(normalizedContent.root.children)
  } catch (error) {
    console.error('Error converting Lexical content to HTML:', error)
    return ''
  }
}

/**
 * Process an array of Lexical nodes and convert them to HTML
 */
function processNodes(nodes: any[]): string {
  if (!Array.isArray(nodes)) return ''
  
  return nodes.map(processNode).join('')
}

/**
 * Process a single Lexical node and convert it to HTML
 */
function processNode(node: any): string {
  if (!node || typeof node !== 'object') return ''
  
  // Handle different node types
  switch (node.type) {
    case 'text':
      return processTextNode(node)
    
    case 'paragraph':
      return processParagraphNode(node)
    
    case 'heading':
      return processHeadingNode(node)
    
    case 'list':
      return processListNode(node)
    
    case 'listitem':
      return processListItemNode(node)
    
    case 'link':
      return processLinkNode(node)
    
    case 'quote':
      return processQuoteNode(node)
    
    case 'code':
      return processCodeNode(node)
    
    case 'horizontalrule':
      return '<hr />'
    
    case 'image':
      return processImageNode(node)
    
    // Handle custom nodes
    case 'block':
      return processBlockNode(node)
    
    default:
      // For unknown types, try to process children if they exist
      if (node.children && Array.isArray(node.children)) {
        return processNodes(node.children)
      }
      return ''
  }
}

/**
 * Process a text node with formatting
 */
function processTextNode(node: any): string {
  if (!node.text) return ''
  
  let text = String(node.text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  
  // Apply text formatting (order matters for nested formatting)
  if (node.code) text = `<code>${text}</code>`
  if (node.strikethrough) text = `<s>${text}</s>`
  if (node.underline) text = `<u>${text}</u>`
  if (node.italic) text = `<em>${text}</em>`
  if (node.bold) text = `<strong>${text}</strong>`
  
  return text
}

/**
 * Process a paragraph node
 */
function processParagraphNode(node: any): string {
  if (!node.children) return '<p></p>'
  
  const content = processNodes(node.children)
  return `<p>${content}</p>`
}

/**
 * Process a heading node
 */
function processHeadingNode(node: any): string {
  if (!node.children) return ''
  
  const level = node.tag || node.level || 1
  const validLevel = Math.min(Math.max(1, level), 6) // Ensure level is between 1-6
  const content = processNodes(node.children)
  
  return `<h${validLevel}>${content}</h${validLevel}>`
}

/**
 * Process a list node
 */
function processListNode(node: any): string {
  if (!node.children) return ''
  
  const listType = node.listType === 'number' || node.listType === 'ordered' ? 'ol' : 'ul'
  const content = processNodes(node.children)
  
  return `<${listType}>${content}</${listType}>`
}

/**
 * Process a list item node
 */
function processListItemNode(node: any): string {
  if (!node.children) return '<li></li>'
  
  const content = processNodes(node.children)
  return `<li>${content}</li>`
}

/**
 * Process a link node
 */
function processLinkNode(node: any): string {
  if (!node.children) return ''
  
  const url = node.url || '#'
  const target = node.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
  const content = processNodes(node.children)
  
  return `<a href="${url}"${target}>${content}</a>`
}

/**
 * Process a quote node
 */
function processQuoteNode(node: any): string {
  if (!node.children) return ''
  
  const content = processNodes(node.children)
  return `<blockquote>${content}</blockquote>`
}

/**
 * Process a code node
 */
function processCodeNode(node: any): string {
  if (!node.children) return ''
  
  const content = processNodes(node.children)
  return `<pre><code>${content}</code></pre>`
}

/**
 * Process an image node
 */
function processImageNode(node: any): string {
  const src = node.src || ''
  const alt = node.alt || ''
  const width = node.width ? ` width="${node.width}"` : ''
  const height = node.height ? ` height="${node.height}"` : ''
  
  return `<img src="${src}" alt="${alt}"${width}${height} style="max-width: 100%; height: auto;" />`
}

/**
 * Process a custom block node
 * This is a simplified implementation - you may need to customize this based on your specific blocks
 */
function processBlockNode(node: any): string {
  // For email templates, we'll create a simplified version of custom blocks
  if (!node.children) return ''
  
  // Try to extract block type and data
  const blockType = node.blockType || 'unknown'
  
  // Handle different block types
  switch (blockType) {
    case 'banner':
      return processBannerBlock(node)
    
    case 'media':
      return processMediaBlock(node)
    
    case 'code':
      return processCodeBlock(node)
    
    default:
      // For unknown block types, just process children
      return processNodes(node.children)
  }
}

/**
 * Process a banner block
 */
function processBannerBlock(node: any): string {
  const content = node.content ? processNodes(node.content.root?.children || []) : ''
  const backgroundColor = node.backgroundColor || '#f5f5f5'
  const textColor = node.textColor || '#333333'
  
  return `
    <div style="background-color: ${backgroundColor}; color: ${textColor}; padding: 20px; margin: 20px 0; border-radius: 5px;">
      ${content}
    </div>
  `
}

/**
 * Process a media block
 */
function processMediaBlock(node: any): string {
  // For email templates, we'll just include the image with a caption
  const mediaUrl = node.media?.url || node.url || ''
  const caption = node.caption || ''
  
  if (!mediaUrl) return ''
  
  return `
    <div style="margin: 20px 0;">
      <img src="${mediaUrl}" alt="${caption}" style="max-width: 100%; height: auto;" />
      ${caption ? `<p style="font-style: italic; margin-top: 8px;">${caption}</p>` : ''}
    </div>
  `
}

/**
 * Process a code block
 */
function processCodeBlock(node: any): string {
  const code = node.code || ''
  const language = node.language || ''
  
  return `
    <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
      <code>${code}</code>
    </pre>
  `
}
