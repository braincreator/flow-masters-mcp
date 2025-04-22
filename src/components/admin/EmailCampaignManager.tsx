'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, Chip, CircularProgress, Divider, Grid, IconButton, List, ListItem, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { PlayArrow, Pause, Refresh, Delete } from '@mui/icons-material'
import { usePayloadAPI } from '@/hooks/usePayloadAPI'

const statusColors = {
  draft: 'default',
  active: 'primary',
  processing: 'secondary',
  completed: 'success',
  paused: 'warning',
  error: 'error',
}

const EmailCampaignManager: React.FC = () => {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
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
    setRefreshTrigger(prev => prev + 1)
  }

  const handleTriggerCampaign = async (campaignId) => {
    try {
      const response = await fetch('/api/v1/email-campaigns/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to trigger campaign')
      }

      // Refresh the list
      handleRefresh()
    } catch (error) {
      console.error('Error triggering campaign:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handlePauseCampaign = async (campaignId) => {
    try {
      const response = await fetch(`/api/email-campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paused' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to pause campaign')
      }

      // Refresh the list
      handleRefresh()
    } catch (error) {
      console.error('Error pausing campaign:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleViewDetails = async (campaignId) => {
    try {
      const response = await fetch(`/api/v1/email-campaigns/status?id=${campaignId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get campaign details')
      }
      
      const campaignDetails = await response.json()
      setSelectedCampaign(campaignDetails)
    } catch (error) {
      console.error('Error getting campaign details:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleCreateCampaign = () => {
    router.push('/admin/collections/email-campaigns/create')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <Typography color="error">Error loading campaigns: {error.message}</Typography>
        <Button variant="contained" onClick={handleRefresh} startIcon={<Refresh />} style={{ marginTop: '1rem' }}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Typography variant="h5">Email Campaigns</Typography>
            <div>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleCreateCampaign}
                style={{ marginRight: '1rem' }}
              >
                Create Campaign
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Refresh />} 
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </div>
          </div>
        </Grid>

        <Grid item xs={12} md={selectedCampaign ? 7 : 12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Stats</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} onClick={() => handleViewDetails(campaign.id)} style={{ cursor: 'pointer' }}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={campaign.status} 
                        color={statusColors[campaign.status] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{campaign.triggerType}</TableCell>
                    <TableCell>{campaign.lastRun ? new Date(campaign.lastRun).toLocaleString() : 'Never'}</TableCell>
                    <TableCell>
                      {campaign.stats?.totalSent ? `${campaign.stats.totalSent} sent` : 'No data'}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTriggerCampaign(campaign.id)
                        }}
                        disabled={!['draft', 'paused'].includes(campaign.status)}
                      >
                        <PlayArrow />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePauseCampaign(campaign.id)
                        }}
                        disabled={!['active', 'processing'].includes(campaign.status)}
                      >
                        <Pause />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/collections/email-campaigns/${campaign.id}`)
                        }}
                      >
                        <Refresh />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {campaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" style={{ padding: '2rem' }}>
                        No campaigns found. Create your first email campaign to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {selectedCampaign && (
          <Grid item xs={12} md={5}>
            <Card>
              <CardHeader 
                title={selectedCampaign.name}
                subheader={
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                    <Chip 
                      label={selectedCampaign.status} 
                      color={statusColors[selectedCampaign.status] || 'default'} 
                      size="small" 
                      style={{ marginRight: '0.5rem' }}
                    />
                    {selectedCampaign.lastRun && (
                      <Typography variant="caption">
                        Last run: {new Date(selectedCampaign.lastRun).toLocaleString()}
                      </Typography>
                    )}
                  </div>
                }
                action={
                  <IconButton onClick={() => setSelectedCampaign(null)}>
                    <Delete />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="h6" gutterBottom>Campaign Stats</Typography>
                <Grid container spacing={2} style={{ marginBottom: '1rem' }}>
                  <Grid item xs={6}>
                    <Paper style={{ padding: '1rem', textAlign: 'center' }}>
                      <Typography variant="h4">{selectedCampaign.stats?.totalSent || 0}</Typography>
                      <Typography variant="body2" color="textSecondary">Emails Sent</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper style={{ padding: '1rem', textAlign: 'center' }}>
                      <Typography variant="h4">{selectedCampaign.stats?.opened || 0}</Typography>
                      <Typography variant="body2" color="textSecondary">Opened</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom>Recent Logs</Typography>
                <List dense>
                  {selectedCampaign.recentLogs?.map((log, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={log.message}
                        secondary={new Date(log.timestamp).toLocaleString()}
                        primaryTypographyProps={{ 
                          color: log.level === 'error' ? 'error' : 'textPrimary',
                          variant: 'body2'
                        }}
                      />
                    </ListItem>
                  ))}
                  {(!selectedCampaign.recentLogs || selectedCampaign.recentLogs.length === 0) && (
                    <ListItem>
                      <ListItemText
                        primary="No logs available"
                        primaryTypographyProps={{ color: 'textSecondary', variant: 'body2' }}
                      />
                    </ListItem>
                  )}
                </List>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleTriggerCampaign(selectedCampaign.id)}
                    disabled={!['draft', 'paused'].includes(selectedCampaign.status)}
                  >
                    Run Campaign
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => router.push(`/admin/collections/email-campaigns/${selectedCampaign.id}`)}
                  >
                    Edit Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </div>
  )
}

export default EmailCampaignManager
