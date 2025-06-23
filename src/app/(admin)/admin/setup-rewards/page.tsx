'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, CheckCircle2 } from 'lucide-react'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
const SetupRewardsPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSetupRewards = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // First, check authentication status
      const authCheckResponse = await fetch('/api/auth-test', {
        method: 'GET',
        credentials: 'include',
      })

      const authData = await authCheckResponse.json()
      logDebug('Auth check result:', authData)

      // Check if the user is authenticated
      if (!authData.sessionAuth.isAuthenticated) {
        throw new Error('You are not authenticated. Please log in and try again.')
      }

      // Check if the user is an admin
      if (!authData.sessionAuth.user.isAdmin && authData.sessionAuth.user.role !== 'admin') {
        throw new Error(
          'You do not have permission to perform this action. Admin access is required.',
        )
      }

      // Now call the setup-rewards endpoint
      const response = await fetch('/api/v1/setup-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Important to include cookies with the session
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        // Обрабатываем разные коды ошибок
        if (response.status === 401) {
          throw new Error(
            'You need to be logged in to perform this action. Please log in and try again.',
          )
        } else if (response.status === 403) {
          throw new Error(
            'You do not have permission to perform this action. Admin access is required.',
          )
        } else {
          throw new Error(data.message || 'Failed to set up rewards system')
        }
      }

      setResult(data)
    } catch (err: any) {
      logError('Error setting up rewards:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reward System Setup</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup Tool</CardTitle>
          <CardDescription>
            Configure the reward system with email templates and campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">
              This tool will set up the reward system by:
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Creating email templates for rewards</li>
              <li>Setting up email campaigns for reward events</li>
              <li>Configuring the reward automation system</li>
            </ul>
          </div>

          <div className="mt-6">
            <Button onClick={handleSetupRewards} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Set Up Reward System'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Setup Completed Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Templates:</h3>
                <ul className="list-disc pl-6">
                  <li>Created: {result.results.templates.created}</li>
                  <li>Already existing: {result.results.templates.existing}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Campaigns:</h3>
                <ul className="list-disc pl-6">
                  <li>Created: {result.results.campaigns.created}</li>
                  <li>Already existing: {result.results.campaigns.existing}</li>
                </ul>
              </div>

              <p className="mt-4">
                The reward system is now ready to use. You can customize the email templates and
                campaigns in the admin panel.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SetupRewardsPage
