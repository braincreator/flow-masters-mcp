'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Loader2, PlayCircle, PauseCircle, RefreshCw, X, AlertCircle, Edit } from 'lucide-react'
import { AppError } from '@/utilities/errorHandling'
import { usePayloadAPI } from '@/hooks/usePayloadAPI'
import { cn } from '@/utilities/ui'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Campaign {
  id: string
  name: string
  status: string
  triggerType: string
  lastRun?: string
  stats?: {
    totalSent?: number
    opened?: number
  }
  recentLogs?: Array<{
    message: string
    timestamp: string
    level: string
  }>
}

// Mapping status to variant for Badge component
const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'draft':
      return 'secondary'
    case 'active':
      return 'default'
    case 'processing':
      return 'default'
    case 'completed':
      return 'default'
    case 'paused':
      return 'secondary'
    case 'error':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const EmailCampaignManager: React.FC = () => {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { data, error } = usePayloadAPI(`/api/email-campaigns?limit=100&depth=0&sort=-createdAt`, {
    refreshInterval: 10000, // Refresh every 10 seconds
    refreshDeps: [refreshTrigger],
  })

  useEffect(() => {
    if (data) {
      setCampaigns(data.docs)
      setLoading(false)
    }
  }, [data])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleTriggerCampaign = async (campaignId: string) => {
    try {
      const response = await fetch('/api/email-campaigns/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId }),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to trigger campaign')
      }

      handleRefresh()
    } catch (error: unknown) {
      logError('Error triggering campaign:', error)
      if (error instanceof Error) {
        new AppError({ message: `Error: ${error.message}` }).notify()
      } else {
        new AppError({ message: 'An unknown error occurred' }).notify()
      }
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/email-campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paused' }),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to pause campaign')
      }

      handleRefresh()
    } catch (error: unknown) {
      logError('Error pausing campaign:', error)
      if (error instanceof Error) {
        new AppError({ message: `Error: ${error.message}` }).notify()
      } else {
        new AppError({ message: 'An unknown error occurred' }).notify()
      }
    }
  }

  const handleViewDetails = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/email-campaigns/status?id=${campaignId}`, {
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get campaign details')
      }

      const campaignDetails = await response.json()
      setSelectedCampaign(campaignDetails)
    } catch (error: unknown) {
      logError('Error getting campaign details:', error)
      if (error instanceof Error) {
        new AppError({ message: `Error: ${error.message}` }).notify()
      } else {
        new AppError({ message: 'An unknown error occurred' }).notify()
      }
    }
  }

  const handleCreateCampaign = () => {
    router.push('/admin/collections/email-campaigns/create')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertCircle className="h-5 w-5" />
          <p>Error loading campaigns: {error.message}</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Email Campaigns</h2>
        <div className="flex gap-2">
          <Button onClick={handleCreateCampaign} className="mr-2">
            Create Campaign
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className={cn('col-span-1', selectedCampaign ? 'md:col-span-7' : 'md:col-span-12')}>
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>Manage your email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow
                      key={campaign.id}
                      className="cursor-pointer"
                      onClick={() => handleViewDetails(campaign.id)}
                    >
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                      </TableCell>
                      <TableCell>{campaign.triggerType}</TableCell>
                      <TableCell>
                        {campaign.lastRun ? new Date(campaign.lastRun).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        {campaign.stats?.totalSent ? `${campaign.stats.totalSent} sent` : 'No data'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTriggerCampaign(campaign.id)
                            }}
                            disabled={!['draft', 'paused'].includes(campaign.status)}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePauseCampaign(campaign.id)
                            }}
                            disabled={!['active', 'processing'].includes(campaign.status)}
                          >
                            <PauseCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/collections/email-campaigns/${campaign.id}`)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {campaigns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No campaigns found. Create your first email campaign to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {selectedCampaign && (
          <div className="col-span-1 md:col-span-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedCampaign.name}</CardTitle>
                  <div className="flex items-center mt-2">
                    <Badge variant={getStatusVariant(selectedCampaign.status)} className="mr-2">
                      {selectedCampaign.status}
                    </Badge>
                    {selectedCampaign.lastRun && (
                      <span className="text-xs text-muted-foreground">
                        Last run: {new Date(selectedCampaign.lastRun).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCampaign(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Campaign Stats</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{selectedCampaign.stats?.totalSent || 0}</p>
                      <p className="text-sm text-muted-foreground">Emails Sent</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{selectedCampaign.stats?.opened || 0}</p>
                      <p className="text-sm text-muted-foreground">Opened</p>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-semibold mb-4">Recent Logs</h3>
                {selectedCampaign.recentLogs && selectedCampaign.recentLogs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCampaign.recentLogs.map((log, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            log.level === 'error' ? 'text-destructive' : '',
                          )}
                        >
                          {log.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">No logs available</p>
                )}

                <div className="flex justify-between mt-6">
                  <Button
                    onClick={() => handleTriggerCampaign(selectedCampaign.id)}
                    disabled={!['draft', 'paused'].includes(selectedCampaign.status)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Run Campaign
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/admin/collections/email-campaigns/${selectedCampaign.id}`)
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailCampaignManager
