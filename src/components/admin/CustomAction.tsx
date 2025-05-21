'use client'

import React from 'react'
import { AppError, ErrorSeverity } from '@/utilities/errorHandling'
import { Button } from '@payloadcms/ui'

const CustomAction: React.FC = () => {
  const handleClick = () => {
    new AppError({ message: 'Custom action triggered!', severity: ErrorSeverity.INFO }).notify()
  }

  return (
    <Button className="custom-action-button" onClick={handleClick} buttonStyle="secondary">
      Quick Action
      <style jsx>{`
        .custom-action-button {
          margin-left: var(--base);
        }
      `}</style>
    </Button>
  )
}

export default CustomAction
