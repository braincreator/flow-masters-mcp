import React from 'react'
import { Metadata } from 'next'
import EndpointBrowser from '@/components/admin/EndpointBrowser'

export const metadata: Metadata = {
  title: 'API Endpoints Browser',
  description: 'Browse and test all available API endpoints',
}

export default function EndpointsPage() {
  return <EndpointBrowser />
}
