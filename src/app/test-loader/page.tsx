'use client'

import { Button } from '@/components/ui/button'
import { useLoading } from '@/providers/LoadingProvider'
import { useEffect } from 'react'

export default function TestLoaderPage() {
  const { startLoading, stopLoading, isLoading } = useLoading()

  // Automatically start loading when the page loads
  useEffect(() => {
    startLoading()
    
    // Stop loading after 5 seconds
    const timeout = setTimeout(() => {
      stopLoading()
    }, 5000)
    
    return () => clearTimeout(timeout)
  }, [startLoading, stopLoading])

  return (
    <div className="container mx-auto py-12 space-y-8">
      <h1 className="text-3xl font-bold">Loader Test Page</h1>
      
      <div className="flex gap-4">
        <Button onClick={startLoading} disabled={isLoading}>
          Start Loading
        </Button>
        
        <Button onClick={stopLoading} disabled={!isLoading} variant="outline">
          Stop Loading
        </Button>
      </div>
      
      <div className="p-6 border rounded-lg">
        <p>
          This page demonstrates the new AutomationLoader component. The loader should appear automatically
          when the page loads and disappear after 5 seconds. You can also manually trigger it using the
          buttons above.
        </p>
        <p className="mt-4">
          The loader visualizes automation processes and logic flow with smooth transitions. It includes:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Logic gates (AND, OR, XOR, etc.)</li>
          <li>Data packets flowing through circuits</li>
          <li>Processing nodes</li>
          <li>Smooth transitions in and out</li>
        </ul>
      </div>
    </div>
  )
}
