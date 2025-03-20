'use client'

import { Analytics } from '@/components/Analytics'
import { ThemeProvider } from '@/providers/Theme'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { DropdownProvider } from '@/providers/DropdownContext'
import { I18nProvider } from '@/providers/I18n'

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
          <HeaderThemeProvider>
            <Analytics 
              googleAnalyticsId={siteConfig?.analytics?.googleAnalyticsId}
              metaPixelId={siteConfig?.analytics?.metaPixelId}
            />
            {children}
          </HeaderThemeProvider>
        </I18nProvider>
      </ThemeProvider>
    </DropdownProvider>
  )
}
