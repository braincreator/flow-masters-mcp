import type { Config } from '../payload-types'
import { generateColorVariations } from '@/utilities/color'

type BrandingConfig = Config['globals']['site-config']['branding']

export function generateThemeVariables(branding?: BrandingConfig) {
  if (!branding?.colors) return {}

  const primary = branding.colors.primary || '#2563eb'
  const secondary = branding.colors.secondary || '#1e293b'
  const accent = branding.colors.accent || '#3b82f6'

  // Generate light theme colors
  const lightPrimary = generateColorVariations(primary, false)
  const lightSecondary = generateColorVariations(secondary, false)
  const lightAccent = generateColorVariations(accent, false)

  // Generate dark theme colors
  const darkPrimary = generateColorVariations(primary, true)
  const darkSecondary = generateColorVariations(secondary, true)
  const darkAccent = generateColorVariations(accent, true)

  return {
    // Light theme
    '--primary': lightPrimary.base,
    '--primary-hover': lightPrimary.hover,
    '--primary-active': lightPrimary.active,
    
    '--secondary': lightSecondary.base,
    '--secondary-hover': lightSecondary.hover,
    '--secondary-active': lightSecondary.active,
    
    '--accent': lightAccent.base,
    '--accent-hover': lightAccent.hover,
    '--accent-active': lightAccent.active,

    // Dark theme colors
    '--dark-primary': darkPrimary.base,
    '--dark-primary-hover': darkPrimary.hover,
    '--dark-primary-active': darkPrimary.active,
    
    '--dark-secondary': darkSecondary.base,
    '--dark-secondary-hover': darkSecondary.hover,
    '--dark-secondary-active': darkSecondary.active,
    
    '--dark-accent': darkAccent.base,
    '--dark-accent-hover': darkAccent.hover,
    '--dark-accent-active': darkAccent.active,

    '--font-primary': branding.fonts?.primary || 'Inter',
    '--font-secondary': branding.fonts?.secondary || 'Georgia',
  }
}


