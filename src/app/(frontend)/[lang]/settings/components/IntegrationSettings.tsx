'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
// Define User interface based on AuthProvider
interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
  level?: number
  xp?: number
  xpToNextLevel?: number
  streak?: number
  lastActive?: string
  bio?: string
}
import { Badge } from '@/components/ui/badge'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface IntegrationSettingsProps {
  user: User
  locale: string
}

interface Integration {
  id: string
  name: string
  icon: string
  connected: boolean
}

export function IntegrationSettings({ user: _user, locale: _locale }: IntegrationSettingsProps) {
  const t = useTranslations('Settings.integrations')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Mock integrations - in a real app, these would come from the user's profile
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google',
      name: 'Google',
      icon: '/icons/google.svg',
      connected: true,
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '/icons/github.svg',
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '/icons/slack.svg',
      connected: false,
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '/icons/discord.svg',
      connected: true,
    },
  ])

  const toggleConnection = async (id: string) => {
    setIsLoading(true)
    setSuccess('')
    setError('')

    try {
      // Here you would implement the API call to connect/disconnect the integration
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? { ...integration, connected: !integration.connected }
            : integration,
        ),
      )

      setSuccess('Integration updated successfully')
    } catch (err) {
      setError('Failed to update integration')
      logError('Error updating integration:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('noIntegrations')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {/* In a real app, you would use actual icons */}
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <Badge
                        variant={integration.connected ? 'default' : 'outline'}
                        className="mt-1"
                      >
                        {integration.connected ? t('connected') : t('notConnected')}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant={integration.connected ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleConnection(integration.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : integration.connected ? (
                      t('disconnect')
                    ) : (
                      t('connect')
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
