'use client'

import { ThemeProvider } from './Theme/ThemeProvider'
import { DropdownProvider } from './DropdownContext'
import { I18nProvider } from './I18n'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DropdownProvider>
        <I18nProvider defaultLang="en">
          {children}
        </I18nProvider>
      </DropdownProvider>
    </ThemeProvider>
  )
}
