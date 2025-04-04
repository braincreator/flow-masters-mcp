'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorButtonWrapperProps {
  label: string
}

export const ErrorButtonWrapper: React.FC<ErrorButtonWrapperProps> = ({ label }) => {
  return (
    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
      {label}
    </Button>
  )
}
