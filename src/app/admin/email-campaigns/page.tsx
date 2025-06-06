import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Campaign Manager',
}

export default async function EmailCampaignsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Email Campaign Manager</h1>
      <p className="text-muted-foreground">
        Email campaign management is temporarily disabled during build optimization.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Please use the Payload CMS admin panel to manage email campaigns.
      </p>
    </div>
  )
}
