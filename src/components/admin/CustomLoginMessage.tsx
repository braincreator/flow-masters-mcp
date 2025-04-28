'use client'

import React from 'react'
import { Card } from '@payloadcms/ui'

const CustomLoginMessage: React.FC = () => {
  return (
    <Card className="custom-login-message">
      <h3>Welcome to Flow Masters Admin</h3>
      <p>Please log in to access the admin panel and manage your content.</p>
      <p>If you need assistance, please contact the system administrator.</p>

      <style jsx>{`
        .custom-login-message {
          margin-bottom: var(--base);
          padding: var(--base);
          text-align: center;
          background-color: var(--theme-elevation-100);
          border-radius: 4px;
        }

        .custom-login-message h3 {
          margin-top: 0;
          color: var(--theme-text);
        }

        .custom-login-message p {
          margin-bottom: calc(var(--base) / 2);
          color: var(--theme-text);
        }
      `}</style>
    </Card>
  )
}

export default CustomLoginMessage
