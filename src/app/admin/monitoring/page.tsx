import React from 'react'
import { Metadata } from 'next'
import MetricsDashboard from '@/components/admin/MetricsDashboard'

export const metadata: Metadata = {
  title: 'System Monitoring',
}

export default function MonitoringPage() {
  return (
    <div className="max-w-7xl mx-auto py-6">
      <MetricsDashboard />
    </div>
  )
}
