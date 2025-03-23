export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  defaultTheme: Theme
  themes: Theme[]
}

export const themeConfig: ThemeConfig = {
  defaultTheme: 'system',
  themes: ['light', 'dark', 'system'],
}

export const defaultBrandingColors = {
  primary: '#4361ee', // Vibrant blue
  secondary: '#7c3aed', // Electric purple
  accent: '#b794f6', // Lighter purple for dark mode compatibility
}

export function generateThemeColors(colors = defaultBrandingColors) {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
  }
}
