import React from 'react'

export function PageLoading() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
        <div className="text-xl font-medium text-primary">Loading...</div>
      </div>
    </div>
  )
}
