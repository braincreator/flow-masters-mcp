/**
 * Helper functions for blog features
 */

import { format, parseISO } from 'date-fns'

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
    console.error('Error formatting date:', error)
    return dateString
  }
}

interface HeadingItem {
  id: string
  text: string
  level: number
}

/**
 * Extract headings from content for table of contents
 * @param content The content to extract headings from
 * @returns Array of heading items with id, text and level
 */
export function extractHeadingsFromContent(content: any): HeadingItem[] {
  if (!content) return []

  // If content is a string (likely HTML), extract headings using regex
  if (typeof content === 'string') {
    const headingRegex = /<h([1-6])(?:[^>]*)id="([^"]*)"(?:[^>]*)>([^<]*)<\/h\1>/g
    const headings: HeadingItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const [, level, id, text] = match
      headings.push({
        id,
        text: text.trim(),
        level: parseInt(level, 10),
      })
    }

    return headings
  }

  // If content has a nodes array (e.g., MDX/rich text content)
  if (content.nodes && Array.isArray(content.nodes)) {
    return content.nodes
      .filter((node) => node.type && node.type.startsWith('heading'))
      .map((node) => {
        const level = parseInt(node.type.replace('heading', ''), 10)
        return {
          id: node.id || generateHeadingId(extractTextFromNode(node)),
          text: extractTextFromNode(node),
          level,
        }
      })
  }

  // If content is some other format, return empty array
  return []
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
 * Calculate estimated reading time for content
 * @param content The content to calculate reading time for
 * @param wordsPerMinute Reading speed in words per minute
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: any, wordsPerMinute = 225): number {
  if (!content) return 0

  const text =
    typeof content === 'string'
      ? content.replace(/<[^>]*>/g, '') // Strip HTML tags
      : extractAllText(content)

  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
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
 * Truncate text to a maximum length
 * @param text The text to truncate
 * @param maxLength Maximum length
 * @param ellipsis String to append when truncated
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength = 150, ellipsis = '...'): string {
  if (!text || text.length <= maxLength) return text

  // Try to truncate at the last space before maxLength
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + ellipsis
  }

  return truncated + ellipsis
}

/**
 * Track a post view in database
 * @param postId The ID of the post to track
 */
export async function trackPostView(postId: string): Promise<void> {
  if (!postId) return

  try {
    // Send a request to track the view
    await fetch('/api/blog/metrics', {
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
    console.error('Failed to track post view:', error)
  }
}
