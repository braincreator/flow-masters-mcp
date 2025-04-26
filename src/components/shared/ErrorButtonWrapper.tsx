'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorButtonWrapperProps {
  locale?: string
  children?: React.ReactNode
  label?: string
}

export const ErrorButtonWrapper: React.FC<ErrorButtonWrapperProps> = ({
  locale,
  children,
  label,
}) => {
  return (
    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
      {children || label || 'Try again'}
    </Button>
  )
}
