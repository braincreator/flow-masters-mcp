'use client'

import { Analytics } from '@/components/Analytics'
import { ThemeProvider } from '@/providers/Theme'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { DropdownProvider } from '@/providers/DropdownContext'
import { I18nProvider } from '@/providers/I18n'
import { Toaster } from 'sonner'
import { PayloadAPIProvider } from '@/providers/payload'

interface RootProviderProps {
  children: React.ReactNode
  lang: string
}

export function RootProvider({ children, lang }: RootProviderProps) {
  return (
    <DropdownProvider>
      <ThemeProvider>
        <I18nProvider defaultLang={lang}>
          <HeaderThemeProvider>
            <PayloadAPIProvider>
              {children}
              <Toaster position="top-right" toastOptions={{ className: 'toast-offset' }} />
            </PayloadAPIProvider>
          </HeaderThemeProvider>
        </I18nProvider>
      </ThemeProvider>
    </DropdownProvider>
  )
}
