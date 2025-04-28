'use client'

import React from 'react'
import { Button } from '@payloadcms/ui'

const CustomAction: React.FC = () => {
  const handleClick = () => {
    alert('Custom action triggered!')
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
