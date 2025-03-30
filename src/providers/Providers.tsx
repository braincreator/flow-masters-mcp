'use client'

import { ThemeProvider } from './Theme'
import { DropdownProvider } from './DropdownContext'
import { I18nProvider } from './I18n'
import { HeaderThemeProvider } from './HeaderTheme'

interface ProvidersProps {
  children: React.ReactNode
  lang: string
}

export function Providers({ children, lang }: ProvidersProps) {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <DropdownProvider>
          <I18nProvider defaultLang={lang}>
            {children}
          </I18nProvider>
        </DropdownProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
