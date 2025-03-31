'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  /* Set the header theme */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    // Use light header theme to contrast with the page background
    setHeaderTheme('light')

    // Scroll to top when page loads
    window.scrollTo(0, 0)

    return () => {
      // Reset header theme when component unmounts
      setHeaderTheme('default')
    }
  }, [setHeaderTheme])

  return null
}

export default PageClient
