'use client'

import { getServerSideURL } from '@/utilities/getURL'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Generates a PayloadCMS API token for client-side authentication
 */
export async function generatePayloadToken() {
  const url = `${getServerSideURL()}/api/users/login`

  logDebug(`Attempting to generate token from: ${url}`)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com',
        password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin',
      }),
      credentials: 'include',
      cache: 'no-cache',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error text available')
      logError(
        `Failed to generate token: Status ${response.status} ${response.statusText}`,
        errorText,
      )
      throw new Error(
        `Failed to generate token: ${response.statusText}. Status: ${response.status}`,
      )
    }

    const data = await response.json()
    logDebug('Token generated successfully')
    return data.token
  } catch (error) {
    logError('Error generating PayloadCMS token:', error)

    // For debugging - log more details about the error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      logError(
        'Network error detected. This could be due to CORS issues or server unavailability.',
      )
      logError('Check that the server is running and properly configured for CORS.')
    }

    return null
  }
}

/**
 * Verifies if the Payload API is accessible
 */
export async function checkPayloadConnection() {
  const url = `${getServerSideURL()}/api/health`

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
    })

    if (!response.ok) {
      return {
        connected: false,
        status: response.status,
        message: response.statusText,
      }
    }

    return {
      connected: true,
      status: response.status,
      data: await response.json(),
    }
  } catch (error) {
    logError('API connection check failed:', error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to API',
    }
  }
}
