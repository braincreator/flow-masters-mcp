/**
 * Converts a hex color to RGB values
 */
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.substring(0, 2), 16)
  const g = parseInt(normalized.substring(2, 4), 16)
  const b = parseInt(normalized.substring(4, 6), 16)
  return { r, g, b }
}

/**
 * Converts RGB to HSL values
 */
function rgbToHSLValues(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

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

  return { 
    h: h * 360, 
    s: s * 100, 
    l: l * 100 
  }
}

/**
 * Converts HSL values to RGB
 */
function hslToRGB(h: number, s: number, l: number): { r: number; g: number; b: number } {
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

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

/**
 * Converts RGB values to HSL string format
 */
function rgbToHSL(r: number, g: number, b: number): string {
  const { h, s, l } = rgbToHSLValues(r, g, b)
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`
}

/**
 * Gets the relative luminance of a color
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRGB(hex)
  
  const [rs, gs, bs] = [r, g, b].map(value => {
    value /= 255
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculates contrast ratio between two luminance values
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Helper function to darken a color
 */
function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRGB(hex)
  const darkenColor = (c: number) => Math.max(0, Math.floor(c * (1 - amount)))
  
  const newR = darkenColor(r)
  const newG = darkenColor(g)
  const newB = darkenColor(b)
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Helper function to lighten a color
 */
function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRGB(hex)
  const lightenColor = (c: number) => Math.min(255, Math.floor(c + (255 - c) * amount))
  
  const newR = lightenColor(r)
  const newG = lightenColor(g)
  const newB = lightenColor(b)
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Generates a hover color by adjusting saturation and lightness
 */
function generateEnhancedHoverColor(hex: string, isDark: boolean): string {
  const { r, g, b } = hexToRGB(hex)
  const { h, s, l } = rgbToHSLValues(r, g, b)
  
  // Enhance saturation and adjust lightness based on theme
  const newS = Math.min(100, s * 1.1) // Increase saturation by 10%
  const newL = isDark
    ? Math.min(100, l * 1.15) // Lighter in dark mode
    : Math.max(0, l * 0.95)   // Darker in light mode

  const { r: newR, g: newG, b: newB } = hslToRGB(h, newS, newL)
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Generates an active color by further adjusting the hover color
 */
function generateEnhancedActiveColor(hex: string, isDark: boolean): string {
  const { r, g, b } = hexToRGB(hex)
  const { h, s, l } = rgbToHSLValues(r, g, b)
  
  // Further enhance saturation and adjust lightness for active state
  const newS = Math.min(100, s * 1.15) // Increase saturation by 15%
  const newL = isDark
    ? Math.min(100, l * 1.25) // Even lighter in dark mode
    : Math.max(0, l * 0.9)    // Even darker in light mode

  const { r: newR, g: newG, b: newB } = hslToRGB(h, newS, newL)
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Converts a hex color to HSL string format
 */
export function hexToHSL(hex: string): string {
  const { r, g, b } = hexToRGB(hex)
  return rgbToHSL(r, g, b)
}

/**
 * Generates a set of theme-aware color variations with enhanced hover states
 */
export function generateColorVariations(hex: string, isDark: boolean) {
  const hoverColor = generateEnhancedHoverColor(hex, isDark)
  const activeColor = generateEnhancedActiveColor(hex, isDark)
  
  // Verify contrast ratios
  const backgroundLuminance = isDark ? 0.1 : 0.9
  const baseLuminance = getLuminance(hex)
  const hoverLuminance = getLuminance(hoverColor)
  const activeLuminance = getLuminance(activeColor)
  
  // Minimum contrast ratio (WCAG AA)
  const minContrast = 4.5
  
  // Adjust if contrast is too low
  if (getContrastRatio(baseLuminance, backgroundLuminance) < minContrast ||
      getContrastRatio(hoverLuminance, backgroundLuminance) < minContrast ||
      getContrastRatio(activeLuminance, backgroundLuminance) < minContrast) {
    // Fall back to simpler contrast-based adjustments
    return {
      base: hexToHSL(hex),
      hover: hexToHSL(isDark ? lighten(hex, 0.1) : darken(hex, 0.1)),
      active: hexToHSL(isDark ? lighten(hex, 0.2) : darken(hex, 0.2))
    }
  }
    
  return {
    base: hexToHSL(hex),
    hover: hexToHSL(hoverColor),
    active: hexToHSL(activeColor)
  }
}
