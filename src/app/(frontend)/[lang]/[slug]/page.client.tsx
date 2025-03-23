'use client'
import { useThemeSwitch } from '@/hooks/useThemeSwitch'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  const { switchTheme } = useThemeSwitch()

  useEffect(() => {
    // The hook will handle system theme preference automatically
    switchTheme('light')
  }, [switchTheme])

  return null
}

export default PageClient
