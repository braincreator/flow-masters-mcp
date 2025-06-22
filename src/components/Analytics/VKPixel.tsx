'use client'

import React, { useEffect, useState } from 'react'
import Script from 'next/script'

interface VKPixelProps {
  pixelId: string
  debug?: boolean
}

declare global {
  interface Window {
    VK?: any
    vkAsyncInit?: () => void
  }
}

export default function VKPixel({ pixelId, debug = false }: VKPixelProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Инициализация VK пикселя
  const initVKPixel = () => {
    if (typeof window !== 'undefined') {
      // Инициализируем VK API
      window.vkAsyncInit = function() {
        if (window.VK) {
          window.VK.Retargeting.Init(pixelId)
          window.VK.Retargeting.Hit()
          
          if (debug && process.env.NODE_ENV === 'development') {
            console.log('✅ VK Pixel initialized successfully with ID:', pixelId)
          }
          setIsLoaded(true)
        }
      }

      // Если VK уже загружен, инициализируем сразу
      if (window.VK) {
        window.vkAsyncInit()
      }
    }
  }

  // Обработка успешной загрузки
  const handleLoad = () => {
    initVKPixel()
    setLoadError(false)
  }

  // Обработка ошибки загрузки
  const handleError = () => {
    if (debug && process.env.NODE_ENV === 'development') {
      console.warn('❌ Failed to load VK Pixel script')
    }
    setLoadError(true)
  }

  // Noscript fallback
  const noscriptContent = `
    <div>
      <img src="https://vk.com/rtrg?p=${pixelId}" 
           style="position:fixed; left:-999px;" 
           alt="" />
    </div>
  `

  if (loadError) {
    return (
      <>
        {debug && (
          <div style={{ 
            position: 'fixed', 
            top: '50px', 
            right: '10px', 
            background: '#ff5722', 
            color: 'white', 
            padding: '8px', 
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999
          }}>
            📱 VK Pixel: Error
          </div>
        )}
        <noscript dangerouslySetInnerHTML={{ __html: noscriptContent }} />
      </>
    )
  }

  return (
    <>
      <Script
        id={`vk-pixel-${pixelId}`}
        src="https://vk.com/js/api/openapi.js?169"
        strategy="afterInteractive"
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {debug && isLoaded && (
        <div style={{ 
          position: 'fixed', 
          top: '50px', 
          right: '10px', 
          background: '#2196f3', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          📱 VK Pixel: Active
        </div>
      )}
      
      <noscript dangerouslySetInnerHTML={{ __html: noscriptContent }} />
    </>
  )
}

// Хук для использования VK пикселя в компонентах
export function useVKPixel(pixelId: string) {
  const trackEvent = (event: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Event(event)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 VK Pixel event tracked:', event, params)
      }
    }
  }

  const trackPageView = () => {
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Hit()
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 VK Pixel page view tracked')
      }
    }
  }

  return {
    trackEvent,
    trackPageView
  }
}
