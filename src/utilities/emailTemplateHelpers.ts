/**
 * Email Template Helpers
 * Utility functions for working with email templates
 */

import { lexicalToHtml } from './lexicalToHtml'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Replace placeholders in a string with values from data object
 * Supports nested properties with dot notation (e.g., {{user.name}})
 * 
 * @param text The text containing placeholders
 * @param data The data object with values to replace placeholders
 * @returns The text with placeholders replaced
 */
export function replacePlaceholders(text: string, data: Record<string, any>): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_match, key) => {
    const keys = key.trim().split('.')
    let value = data
    
    // Support for nested properties (e.g., {{user.name}})
    for (const k of keys) {
      if (value === undefined || value === null) break
      value = value[k]
    }
    
    return value !== undefined && value !== null ? String(value) : ''
  })
}

/**
 * Generate a table from an array of items
 * 
 * @param items Array of items to display in the table
 * @param columns Configuration for table columns
 * @returns HTML string for the table
 */
export function generateTable<T>(
  items: T[],
  columns: Array<{
    key: keyof T | ((item: T) => string)
    header: string
    width?: string
    align?: 'left' | 'center' | 'right'
    format?: (value: any) => string
  }>
): string {
  if (!items || items.length === 0) {
    return ''
  }
  
  const tableStyle = `
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  `
  
  const headerStyle = `
    background-color: #f8f8f8;
    padding: 10px;
    text-align: left;
    font-weight: bold;
    border-bottom: 1px solid #eaeaea;
  `
  
  const cellStyle = `
    padding: 10px;
    border-bottom: 1px solid #eaeaea;
  `
  
  // Generate table header
  let tableHtml = `<table style="${tableStyle}">\n<thead>\n<tr>\n`
  
  columns.forEach(column => {
    const style = `${headerStyle}${column.width ? ` width: ${column.width};` : ''}${column.align ? ` text-align: ${column.align};` : ''}`
    tableHtml += `<th style="${style}">${column.header}</th>\n`
  })
  
  tableHtml += `</tr>\n</thead>\n<tbody>\n`
  
  // Generate table rows
  items.forEach(item => {
    tableHtml += `<tr>\n`
    
    columns.forEach(column => {
      const style = `${cellStyle}${column.align ? ` text-align: ${column.align};` : ''}`
      
      // Get the value using the key or function
      let value
      if (typeof column.key === 'function') {
        value = column.key(item)
      } else {
        value = item[column.key]
      }
      
      // Format the value if a formatter is provided
      if (column.format && value !== undefined && value !== null) {
        value = column.format(value)
      }
      
      tableHtml += `<td style="${style}">${value !== undefined && value !== null ? value : ''}</td>\n`
    })
    
    tableHtml += `</tr>\n`
  })
  
  tableHtml += `</tbody>\n</table>`
  
  return tableHtml
}

/**
 * Generate a list from an array of items
 * 
 * @param items Array of items to display in the list
 * @param type Type of list (ul or ol)
 * @param itemRenderer Function to render each item
 * @returns HTML string for the list
 */
export function generateList<T>(
  items: T[],
  type: 'ul' | 'ol' = 'ul',
  itemRenderer: (item: T) => string = item => String(item)
): string {
  if (!items || items.length === 0) {
    return ''
  }
  
  const listStyle = `
    margin: 10px 0;
    padding-left: 20px;
  `
  
  const itemStyle = `
    margin: 5px 0;
  `
  
  let listHtml = `<${type} style="${listStyle}">\n`
  
  items.forEach(item => {
    listHtml += `<li style="${itemStyle}">${itemRenderer(item)}</li>\n`
  })
  
  listHtml += `</${type}>\n`
  
  return listHtml
}

/**
 * Generate a conditional section based on a condition
 * 
 * @param condition Condition to evaluate
 * @param content Content to include if condition is true
 * @param elseContent Optional content to include if condition is false
 * @returns HTML string for the conditional section
 */
export function conditionalSection(
  condition: boolean,
  content: string,
  elseContent: string = ''
): string {
  return condition ? content : elseContent
}

/**
 * Convert Lexical rich text to HTML for email templates
 * 
 * @param richText Lexical rich text object
 * @returns HTML string
 */
export function richTextToHtml(richText: any): string {
  try {
    return lexicalToHtml(richText)
  } catch (error) {
    logError('Error converting rich text to HTML:', error)
    return ''
  }
}

/**
 * Format a date for display in email templates
 * 
 * @param date Date to format
 * @param locale Locale for formatting
 * @param options Options for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'en',
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

/**
 * Format a currency value for display in email templates
 * 
 * @param amount Amount to format
 * @param currency Currency code
 * @param locale Locale for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Generate a button for email templates
 * 
 * @param text Button text
 * @param url Button URL
 * @param options Button options
 * @returns HTML string for the button
 */
export function generateButton(
  text: string,
  url: string,
  options: {
    backgroundColor?: string
    textColor?: string
    borderRadius?: string
    padding?: string
    margin?: string
    align?: 'left' | 'center' | 'right'
  } = {}
): string {
  const {
    backgroundColor = '#0070f3',
    textColor = 'white',
    borderRadius = '5px',
    padding = '12px 25px',
    margin = '20px 0',
    align = 'center'
  } = options
  
  const buttonStyle = `
    display: inline-block;
    padding: ${padding};
    background-color: ${backgroundColor};
    color: ${textColor} !important;
    text-decoration: none;
    border-radius: ${borderRadius};
    margin: ${margin};
    font-weight: bold;
    text-align: center;
  `
  
  const containerStyle = `
    text-align: ${align};
  `
  
  return `
    <div style="${containerStyle}">
      <a href="${url}" style="${buttonStyle}" target="_blank">${text}</a>
    </div>
  `
}

/**
 * Generate a divider for email templates
 * 
 * @param options Divider options
 * @returns HTML string for the divider
 */
export function generateDivider(
  options: {
    color?: string
    margin?: string
    width?: string
  } = {}
): string {
  const {
    color = '#eaeaea',
    margin = '20px 0',
    width = '100%'
  } = options
  
  return `<hr style="border: 0; border-top: 1px solid ${color}; margin: ${margin}; width: ${width};" />`
}
