'use client'

import { Analytics } from '@/components/Analytics'
import { ThemeProvider } from '@/providers/Theme'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { DropdownProvider } from '@/providers/DropdownContext'
import { I18nProvider } from '@/providers/I18n'
import { CartProvider } from '@/providers/CartProvider'
import { Toaster } from 'sonner'

interface RootProviderProps {
  children: React.ReactNode
  lang: string
  siteConfig: any
}

export function RootProvider({ children, lang, siteConfig }: RootProviderProps) {
  return (
    <DropdownProvider>
      <ThemeProvider>
        <I18nProvider defaultLang={lang}>
          <CartProvider>
            <HeaderThemeProvider>
              <Analytics
                googleAnalyticsId={siteConfig?.analytics?.googleAnalyticsId}
                metaPixelId={siteConfig?.analytics?.metaPixelId}
              />
              {children}
              <Toaster />
            </HeaderThemeProvider>
          </CartProvider>
        </I18nProvider>
      </ThemeProvider>
    </DropdownProvider>
  )
}
