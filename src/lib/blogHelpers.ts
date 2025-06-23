/**
 * Helper functions for blog features
 */

import { format, parseISO } from 'date-fns'
import { HeadingItem } from '@/components/blog/TableOfContents'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Format a date string into a human-readable format
 * @param dateString The date string to format
 * @param formatPattern Optional format pattern
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatPattern = 'MMM d, yyyy'): string {
  if (!dateString) return ''

  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
    return format(date, formatPattern)
  } catch (error) {
    logError('Error formatting date:', error)
    return dateString
  }
}

/**
 * Generates a kebab-case slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Extracts headings from a rich text content object
 */
export function extractHeadingsFromContent(content: any): HeadingItem[] {
  // This is a generic implementation - adjust based on your CMS's content structure
  if (!content) return []

  // For Payload CMS rich text content
  if (content.root && content.root.children) {
    const headings: HeadingItem[] = []

    // Find all heading nodes in the content
    const processNode = (node: any) => {
      if (node.type && node.type.startsWith('heading') && node.children) {
        const level = parseInt(node.type.replace('heading', ''))

        if (!isNaN(level) && level >= 1 && level <= 6) {
          // Extract text from children
          let text = ''
          node.children.forEach((child: any) => {
            if (child.text) {
              text += child.text
            }
          })

          if (text) {
            const id = slugify(text)
            headings.push({ id, text, level })
          }
        }
      }

      // Process children recursively
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(processNode)
      }
    }

    content.root.children.forEach(processNode)
    return headings
  }

  // Fallback for simple content structures or other CMS formats
  return []
}

/**
 * Extracts headings from DOM elements within a container
 */
export function extractHeadingsFromDOM(contentElement: Element, maxDepth = 3): HeadingItem[] {
  const headings: HeadingItem[] = []

  // Find all heading elements (h1-h6) up to maxDepth
  const headingSelectors = Array.from({ length: maxDepth }, (_, i) => `h${i + 1}`)
  const headingElements = contentElement.querySelectorAll(headingSelectors.join(','))

  headingElements.forEach((el) => {
    const level = parseInt(el.tagName[1])
    const text = el.textContent || ''

    // Skip empty headings
    if (!text.trim()) return

    // Use existing ID or generate one
    const id = el.id || slugify(text)

    // Set ID on element if it doesn't have one
    if (!el.id) {
      el.id = id
    }

    headings.push({ id, text, level })
  })

  return headings
}

/**
 * Extract text content from a node
 * @param node The node to extract text from
 * @returns The extracted text
 */
export function extractTextFromNode(node: any): string {
  if (!node) return ''

  if (typeof node === 'string') return node

  if (node.text) return node.text

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('')
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromNode).join('')
  }

  return ''
}

/**
 * Generate a heading ID from text
 * @param text The heading text
 * @returns A slug-friendly ID
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

/**
 * Calculates estimated reading time for article content
 */
export function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  if (!content) return 0

  // Count words in content
  const wordCount = content.trim().split(/\s+/).length

  // Calculate reading time in minutes
  const readingTime = Math.ceil(wordCount / wordsPerMinute)

  // Return at least 1 minute
  return Math.max(1, readingTime)
}

/**
 * Extract all text from content (for various content formats)
 * @param content The content to extract text from
 * @returns The extracted text
 */
export function extractAllText(content: any): string {
  if (!content) return ''

  if (typeof content === 'string') return content

  if (Array.isArray(content)) {
    return content.map(extractAllText).join(' ')
  }

  if (content.nodes && Array.isArray(content.nodes)) {
    return content.nodes.map(extractAllText).join(' ')
  }

  if (content.children && Array.isArray(content.children)) {
    return content.children.map(extractAllText).join(' ')
  }

  if (content.content && Array.isArray(content.content)) {
    return content.content.map(extractAllText).join(' ')
  }

  if (content.text) return content.text

  return ''
}

/**
 * Truncates text to a specified length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text

  // Truncate at the last space before maxLength
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

/**
 * Track a post view in database
 * @param postId The ID of the post to track
 */
export async function trackPostView(postId: string): Promise<void> {
  if (!postId) return

  try {
    // Send a request to track the view
    await fetch('/api/v1/blog/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        action: 'view',
      }),
    })
  } catch (error) {
    logError('Failed to track post view:', error)
  }
}

/**
 * Formats a date for display in blog posts, now including time
 */
export function formatBlogDate(date: string | Date, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit', // Add hour
      minute: '2-digit', // Add minute
      hour12: false, // Use 24-hour format if preferred
    }).format(dateObj)
  } catch (error) {
    logError('Error formatting date:', error)
    // Fallback to a simpler format in case of error
    return dateObj.toLocaleDateString(locale)
  }
}

// Helper function to send metrics to the backend
export const sendMetric = async (type: string, postId: string) => {
  try {
    await fetch('/api/v1/blog/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        action: type,
      }),
    })
  } catch (error) {
    logError('Failed to send metric:', error)
  }
}
