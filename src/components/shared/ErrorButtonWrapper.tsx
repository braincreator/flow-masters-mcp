'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorButtonWrapperProps {
  locale: string
  children: React.ReactNode
}

export const ErrorButtonWrapper: React.FC<ErrorButtonWrapperProps> = ({ locale, children }) => {
  return (
    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
      {children}
    </Button>
  )
}
