'use client'

import { Analytics } from '@/components/Analytics'
import { ThemeProvider } from '@/providers/Theme'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { DropdownProvider } from '@/providers/DropdownContext'
import { I18nProvider } from '@/providers/I18n'
import { Toaster } from 'sonner'
import CartInitializer from '@/components/CartInitializer'
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
              <CartInitializer locale={lang as any}>
                {children}
                <Toaster position="top-right" toastOptions={{ className: 'toast-offset' }} />
              </CartInitializer>
            </PayloadAPIProvider>
          </HeaderThemeProvider>
        </I18nProvider>
      </ThemeProvider>
    </DropdownProvider>
  )
}
