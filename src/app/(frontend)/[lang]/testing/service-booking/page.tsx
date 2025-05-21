'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the test component to avoid SSR issues
const ServiceBookingFlowTest = dynamic(
  () => import('../../../../../testing/ServiceBookingFlowTest'),
  { ssr: false }
)

export default function ServiceBookingTestPage() {
  return <ServiceBookingFlowTest />
}
