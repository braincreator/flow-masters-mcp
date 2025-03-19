'use client'
import Script from 'next/script'

export function InitTheme() {
  return (
    <Script
      id="theme-script"
      strategy="beforeInteractive"
    >
      {`
        (function initTheme() {
          const theme = localStorage.getItem('theme') || 'light'
          document.documentElement.setAttribute('data-theme', theme)
          document.documentElement.style.opacity = '1'
        })()
      `}
    </Script>
  )
}
