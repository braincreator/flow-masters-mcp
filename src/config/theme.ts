import { type Config } from '@/payload-types'

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  defaultTheme: Theme
  themes: Theme[]
}

export const themeConfig: ThemeConfig = {
  defaultTheme: 'system',
  themes: ['light', 'dark', 'system'],
}

export function generateThemeColors(branding?: Config['globals']['site-config']['branding']) {
  if (!branding?.colors) return {}

  const colors = branding.colors

  return {
    primary: {
      DEFAULT: colors.primary || '#2563eb',
      foreground: colors.primaryForeground || '#ffffff',
      hover: colors.primaryHover || adjustColor(colors.primary || '#2563eb', { l: -10 }),
      active: colors.primaryActive || adjustColor(colors.primary || '#2563eb', { l: -20 }),
    },
    secondary: {
      DEFAULT: colors.secondary || '#1e293b',
      foreground: colors.secondaryForeground || '#ffffff',
      hover: colors.secondaryHover || adjustColor(colors.secondary || '#1e293b', { l: -10 }),
      active: colors.secondaryActive || adjustColor(colors.secondary || '#1e293b', { l: -20 }),
    },
    accent: {
      DEFAULT: colors.accent || '#3b82f6',
      foreground: colors.accentForeground || '#ffffff',
      hover: colors.accentHover || adjustColor(colors.accent || '#3b82f6', { l: -10 }),
      active: colors.accentActive || adjustColor(colors.accent || '#3b82f6', { l: -20 }),
    },
  }
}

function adjustColor(hex: string, { h = 0, s = 0, l = 0 }) {
  let { h: hue, s: sat, l: light } = hexToHSL(hex)
  
  hue = clamp(hue + h, 0, 360)
  sat = clamp(sat + s, 0, 100)
  light = clamp(light + l, 0, 100)
  
  return hslToHex(hue, sat, light)
}

function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) throw new Error('Invalid hex color')
  
  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360
  s /= 100
  l /= 100
  
  let r: number, g: number, b: number
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
