import { NextResponse } from 'next/server'

/**
 * Helper function to create a standardized error response
 * @param message Error message
 * @param status HTTP status code
 * @returns NextResponse with error message and status
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  )
}

/**
 * Helper function to create a standardized success response
 * @param data Response data
 * @param status HTTP status code
 * @returns NextResponse with success message and data
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status },
  )
}

/**
 * Fetches current exchange rates from an external API
 * @returns A record of exchange rates in the format {USD_EUR: 0.85, USD_GBP: 0.75, ...}
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()

    if (!data.rates) {
      throw new Error('Invalid response from exchange rate API')
    }

    // Convert response to the required format (USD_EUR, USD_GBP, etc.)
    const formattedRates: Record<string, number> = {}

    Object.entries(data.rates).forEach(([currency, rate]) => {
      formattedRates[`USD_${currency}`] = rate as number
    })

    return formattedRates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    return {} // Return empty object on error, service will use manual rates
  }
}
