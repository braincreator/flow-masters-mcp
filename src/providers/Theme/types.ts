export type Theme = 'dark' | 'light' | 'system'

export interface ThemeContextType {
  setTheme: (theme: Theme | null) => void
  theme: Theme
}

export function themeIsValid(string: null | string): string is Theme {
  return string ? ['dark', 'light', 'system'].includes(string) : false
}
