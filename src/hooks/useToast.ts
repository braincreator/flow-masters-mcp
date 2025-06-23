'use client'

import { useCallback } from 'react'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type ToastType = 'success' | 'error' | 'warning' | 'info'

export const useToast = () => {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    logDebug(`[Toast] ${type}: ${message}`)

    // In a real implementation, you would show a toast notification
    // This is a minimal implementation for development
    if (typeof window !== 'undefined') {
      // Create a simple toast element
      const toast = document.createElement('div')
      toast.className = `toast toast-${type}`
      toast.textContent = message

      // Style the toast
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 16px',
        borderRadius: '4px',
        color: 'white',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s ease-in-out',
        background:
          type === 'success'
            ? '#4caf50'
            : type === 'error'
              ? '#f44336'
              : type === 'warning'
                ? '#ff9800'
                : '#2196f3',
      })

      // Add to DOM
      document.body.appendChild(toast)

      // Show and then hide after delay
      setTimeout(() => {
        toast.style.opacity = '1'
      }, 10)
      setTimeout(() => {
        toast.style.opacity = '0'
        setTimeout(() => document.body.removeChild(toast), 300)
      }, 3000)
    }
  }, [])

  return {
    showToast,
  }
}

export default useToast
