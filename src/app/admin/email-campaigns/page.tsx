import React from 'react'
import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload'
import { AdminView } from '@/components/admin/AdminView'
import EmailCampaignManager from '@/components/admin/EmailCampaignManager'

export const metadata: Metadata = {
  title: 'Email Campaign Manager',
}

export default async function EmailCampaignsPage() {
  const payload = await getPayloadClient()

  return (
    <AdminView payload={payload}>
      <EmailCampaignManager />
    </AdminView>
  )
}
