/**
 * Utility functions for generating and formatting order numbers
 */

/**
 * Standard order number format: PREFIX-YYYYMMDD-XXXXX
 * Where:
 * - PREFIX is a 3-4 character code indicating order type (e.g., ORD, SERV)
 * - YYYYMMDD is the date in compact format
 * - XXXXX is a random alphanumeric string for uniqueness
 */

/**
 * Order type prefixes for consistent usage across the application
 */
export const ORDER_PREFIXES = {
  DEFAULT: 'ORD',
  SERVICE: 'SERV',
  PRODUCT: 'PROD',
  SUBSCRIPTION: 'SUBS',
  COURSE: 'CRSE',
};

/**
 * Generates a unique order number with a consistent format
 * Format: PREFIX-YYYYMMDD-XXXXX where XXXXX is a random alphanumeric string
 *
 * @param prefix Optional prefix to use instead of 'ORD'
 * @returns A formatted order number string
 */
export function generateOrderNumber(prefix: string = ORDER_PREFIXES.DEFAULT): string {
  // Ensure prefix is uppercase and between 3-4 characters
  const normalizedPrefix = prefix.toUpperCase().substring(0, 4);

  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Generate random alphanumeric string (5 characters)
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();

  // Combine into final format
  return `${normalizedPrefix}-${dateStr}-${randomStr}`;
}

/**
 * Formats an existing order ID into a readable order number if it's not already formatted
 *
 * @param orderId The order ID or existing order number
 * @param orderType Optional order type to determine prefix
 * @returns A formatted order number string
 */
export function formatOrderNumber(orderId: string, orderType?: string): string {
  // If it already looks like a formatted order number, return it as is
  if (/^[A-Z]+-\d{8}-[A-Z0-9]{5}$/.test(orderId)) {
    return orderId;
  }

  // Determine prefix based on order type
  let prefix = ORDER_PREFIXES.DEFAULT;
  if (orderType) {
    switch (orderType.toLowerCase()) {
      case 'service':
        prefix = ORDER_PREFIXES.SERVICE;
        break;
      case 'product':
        prefix = ORDER_PREFIXES.PRODUCT;
        break;
      case 'subscription':
        prefix = ORDER_PREFIXES.SUBSCRIPTION;
        break;
      case 'course':
        prefix = ORDER_PREFIXES.COURSE;
        break;
    }
  }

  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Use first 5 characters of the ID (or pad if shorter)
  const idPart = orderId.substring(0, 5).toUpperCase().padEnd(5, '0');

  return `${prefix}-${dateStr}-${idPart}`;
}

/**
 * Extracts a short version of the order number for display purposes
 * For example: ORD-20230615-AB12C -> AB12C
 *
 * @param orderNumber The full order number
 * @returns The short version of the order number
 */
export function getShortOrderNumber(orderNumber: string): string {
  if (!orderNumber) return '';

  const parts = orderNumber.split('-');
  if (parts.length >= 3 && parts[2]) {
    return parts[2];
  }
  return orderNumber;
}

/**
 * Formats an order number for display with consistent formatting
 *
 * @param orderNumber The order number to format
 * @param includePrefix Whether to include the prefix in the formatted output
 * @returns A formatted order number string for display
 */
export function formatOrderNumberForDisplay(orderNumber: string, includePrefix: boolean = true): string {
  if (!orderNumber) return '';

  // If it's not in the standard format, return as is
  if (!/^[A-Z]+-\d{8}-[A-Z0-9]{5}$/.test(orderNumber)) {
    return orderNumber;
  }

  const parts = orderNumber.split('-');

  if (parts.length < 3) {
    return orderNumber;
  }

  if (includePrefix && parts[0] && parts[2]) {
    // Format as "PREFIX-XXXXXXXX"
    return `${parts[0]}-${parts[2]}`;
  } else if (parts[2]) {
    // Format as just "XXXXXXXX"
    return parts[2];
  } else {
    // Fallback to original order number
    return orderNumber;
  }
}
