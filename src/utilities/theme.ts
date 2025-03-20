import type { Config } from '../payload-types'

type BrandingConfig = Config['globals']['site-config']['branding']

export function generateThemeVariables(branding?: BrandingConfig) {
  if (!branding?.colors) return {}

  return {
    '--primary': hexToHSL(branding.colors.primary || '#2563eb'),
    '--secondary': hexToHSL(branding.colors.secondary || '#1e293b'),
    '--accent': hexToHSL(branding.colors.accent || '#3b82f6'),
    '--font-primary': branding.fonts?.primary || 'Inter',
    '--font-secondary': branding.fonts?.secondary || 'Georgia',
  }
}

function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace('#', '')

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  // Find greatest and smallest channel values
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  
  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    
    h /= 6
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return `${h} ${s}% ${l}%`
}