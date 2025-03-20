'use client'

import React, { useEffect, useState } from 'react'
import { DeleteConfigButton } from '../DeleteConfigButton'

export const DeleteConfigSection: React.FC = () => {
  const [configExists, setConfigExists] = useState(false)

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/check-site-config')
        const { exists } = await response.json()
        setConfigExists(exists)
      } catch (error) {
        console.error('Failed to check site config:', error)
      }
    }

    checkConfig()
  }, [])

  if (!configExists || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <DeleteConfigButton />
    </div>
  )
}