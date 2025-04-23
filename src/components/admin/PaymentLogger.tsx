'use client'

import React, { useEffect } from 'react'

// This component will be added to the admin UI to help debug form submissions
const PaymentLogger: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Сохраняем оригинальный fetch для восстановления
    const originalFetch = window.fetch
    let fetchPatched = false

    // Watch all form submissions in the admin panel
    const handleSubmit = (event: any) => {
      if (event.target.closest('form')) {
        console.log('Form submission detected:', event.target.closest('form'))

        // Патчим fetch только если еще не патчили
        if (!fetchPatched) {
          window.fetch = async function (url, options) {
            if (typeof url === 'string' && url.includes('/api/globals/settings')) {
              console.log('Payment settings submission detected', {
                url,
                method: options?.method || 'GET',
                body: options?.body ? JSON.parse(options.body as string) : null,
              })

              // Track the response
              const response = await originalFetch(url, options)
              const clone = response.clone()
              const responseData = await clone.json()
              console.log('Response from settings save:', responseData)
              return response
            }
            return originalFetch(url, options)
          }
          fetchPatched = true
        }
      }
    }

    document.addEventListener('submit', handleSubmit)

    // Also monitor DOM changes to detect when settings are updated in the UI
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'childList' &&
          mutation.target instanceof HTMLElement &&
          mutation.target.closest('[data-field-path*="paymentSettings"]')
        ) {
          console.log('Payment settings DOM update detected:', {
            target: mutation.target,
            addedNodes: mutation.addedNodes,
          })
        }
      })
    })

    const paymentSettingsNode = document.querySelector('[data-field-path*="paymentSettings"]')
    if (paymentSettingsNode) {
      observer.observe(paymentSettingsNode, { childList: true, subtree: true })
      console.log('Payment settings monitoring activated')
    }

    return () => {
      document.removeEventListener('submit', handleSubmit)
      observer.disconnect()

      // Восстанавливаем оригинальный fetch только если мы его патчили
      if (fetchPatched && window.fetch !== originalFetch) {
        window.fetch = originalFetch
      }
    }
  }, [])

  return null // Render nothing, just for debugging
}

export default PaymentLogger
