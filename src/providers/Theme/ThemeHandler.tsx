'use client'
import { useEffect } from 'react'

export function ThemeHandler() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.removeProperty('opacity')
  }, [])

  return null
}