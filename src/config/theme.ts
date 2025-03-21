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
  primary: '#2563eb',
  secondary: '#1e293b',
  accent: '#3b82f6',
}

export function generateThemeColors(colors = defaultBrandingColors) {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
  }
}
