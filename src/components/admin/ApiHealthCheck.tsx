'use client'

import React, { useEffect, useState } from 'react'
import { checkPayloadConnection } from '@/utilities/payload/auth'
import { getServerSideURL } from '@/utilities/getURL'

interface HealthStatus {
  connected: boolean
  status?: number
  message?: string
  error?: string
  data?: any
}

const ApiHealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverUrl, setServerUrl] = useState('')
  const [corsStatus, setCorsStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [authStatus, setAuthStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [adminFetchStatus, setAdminFetchStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true)
      try {
        setServerUrl(getServerSideURL())
        const status = await checkPayloadConnection()
        setHealthStatus(status)

        // Check CORS with OPTIONS request
        try {
          const corsResponse = await fetch(`${getServerSideURL()}/api/health`, {
            method: 'OPTIONS',
            cache: 'no-cache',
          })
          setCorsStatus(corsResponse.ok ? 'ok' : 'error')
        } catch (e) {
          setCorsStatus('error')
          console.error('CORS check failed:', e)
        }

        // Check auth endpoint
        try {
          const authResponse = await fetch(`${getServerSideURL()}/api/users/me`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache',
          })
          setAuthStatus(authResponse.ok ? 'ok' : 'error')
        } catch (e) {
          setAuthStatus('error')
          console.error('Auth check failed:', e)
        }

        // Try to fetch admin collections list
        try {
          const adminResponse = await fetch(`${getServerSideURL()}/api/payload-preferences`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache',
          })
          setAdminFetchStatus(adminResponse.ok ? 'ok' : 'error')
        } catch (e) {
          setAdminFetchStatus('error')
          console.error('Admin API check failed:', e)
        }
      } catch (error) {
        console.error('Health check failed:', error)
        setHealthStatus({
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  if (loading) {
    return <div className="p-4">Checking API connectivity...</div>
  }

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">API Connectivity Diagnosis</h2>

      <div className="mb-4">
        <div className="font-medium">Server URL:</div>
        <div className="text-gray-700 break-all">{serverUrl}</div>
      </div>

      <div className="mb-4">
        <div className="font-medium">Health Status:</div>
        <div className={`font-bold ${healthStatus?.connected ? 'text-green-600' : 'text-red-600'}`}>
          {healthStatus?.connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="mb-4">
        <div className="font-medium">CORS Status:</div>
        <div
          className={`font-bold ${
            corsStatus === 'ok'
              ? 'text-green-600'
              : corsStatus === 'error'
                ? 'text-red-600'
                : 'text-gray-600'
          }`}
        >
          {corsStatus === 'ok' ? 'Working' : corsStatus === 'error' ? 'Failed' : 'Unknown'}
        </div>
      </div>

      <div className="mb-4">
        <div className="font-medium">Authentication Status:</div>
        <div
          className={`font-bold ${
            authStatus === 'ok'
              ? 'text-green-600'
              : authStatus === 'error'
                ? 'text-red-600'
                : 'text-gray-600'
          }`}
        >
          {authStatus === 'ok' ? 'Working' : authStatus === 'error' ? 'Failed' : 'Unknown'}
        </div>
      </div>

      <div className="mb-4">
        <div className="font-medium">Admin API Status:</div>
        <div
          className={`font-bold ${
            adminFetchStatus === 'ok'
              ? 'text-green-600'
              : adminFetchStatus === 'error'
                ? 'text-red-600'
                : 'text-gray-600'
          }`}
        >
          {adminFetchStatus === 'ok'
            ? 'Working'
            : adminFetchStatus === 'error'
              ? 'Failed'
              : 'Unknown'}
        </div>
      </div>

      {healthStatus?.status && (
        <div className="mb-4">
          <div className="font-medium">HTTP Status:</div>
          <div className="text-gray-700">{healthStatus.status}</div>
        </div>
      )}

      {healthStatus?.message && (
        <div className="mb-4">
          <div className="font-medium">Message:</div>
          <div className="text-gray-700">{healthStatus.message}</div>
        </div>
      )}

      {healthStatus?.error && (
        <div className="mb-4">
          <div className="font-medium">Error:</div>
          <div className="text-red-600">{healthStatus.error}</div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <h3 className="font-bold">Troubleshooting Steps:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Check if your server is running</li>
          <li>Verify CORS settings in payload.config.ts</li>
          <li>Check for network connectivity issues</li>
          <li>Ensure your browser allows cookies for authentication</li>
          <li>Try clearing your browser cache and cookies</li>
          <li>Review browser console for additional errors</li>
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-bold mb-2">Technical Details:</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
          {JSON.stringify(healthStatus?.data || {}, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default ApiHealthCheck
