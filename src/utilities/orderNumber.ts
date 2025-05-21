/**
 * Utility functions for generating and formatting order numbers
 */

/**
 * Generates a unique order number with a consistent format
 * Format: ORD-YYYYMMDD-XXXXX where XXXXX is a random alphanumeric string
 * 
 * @param prefix Optional prefix to use instead of 'ORD'
 * @returns A formatted order number string
 */
export function generateOrderNumber(prefix: string = 'ORD'): string {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate random alphanumeric string (5 characters)
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  // Combine into final format
  return `${prefix}-${dateStr}-${randomStr}`;
}

/**
 * Formats an existing order ID into a readable order number if it's not already formatted
 * 
 * @param orderId The order ID or existing order number
 * @returns A formatted order number string
 */
export function formatOrderNumber(orderId: string): string {
  // If it already looks like a formatted order number, return it as is
  if (/^[A-Z]+-\d{8}-[A-Z0-9]{5}$/.test(orderId)) {
    return orderId;
  }
  
  // Otherwise, generate a new formatted number based on the ID
  return `ORD-${Date.now().toString().substring(0, 8)}-${orderId.substring(0, 5).toUpperCase()}`;
}

/**
 * Extracts a short version of the order number for display purposes
 * For example: ORD-20230615-AB12C -> AB12C
 * 
 * @param orderNumber The full order number
 * @returns The short version of the order number
 */
export function getShortOrderNumber(orderNumber: string): string {
  const parts = orderNumber.split('-');
  if (parts.length >= 3) {
    return parts[2];
  }
  return orderNumber;
}
