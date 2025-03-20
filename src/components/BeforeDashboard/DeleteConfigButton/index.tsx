'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'

export const DeleteConfigButton: React.FC = () => {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true)
      return
    }

    try {
      const response = await fetch('/api/delete-site-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete site config')
      }

      // Reload the page after successful deletion
      window.location.href = '/admin'
    } catch (error) {
      console.error('Failed to delete site config:', error)
      setConfirming(false)
    }
  }

  // Auto-reset confirming state after 3 seconds
  React.useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => {
        setConfirming(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [confirming])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
      <Button 
        onClick={handleDelete}
        buttonStyle="secondary"
        backgroundColor={confirming ? "error" : "warning"}
        size="small"
      >
        {confirming ? 'Click again to confirm deletion' : 'Delete Site Config'}
      </Button>
      {confirming && (
        <div style={{ 
          fontSize: '12px',
          color: 'var(--theme-error-500)',
          fontWeight: 500
        }}>
          Warning: This action will reset all site configuration settings
        </div>
      )}
    </div>
  )
}
