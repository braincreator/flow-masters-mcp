'use client'

import { ThemeProvider } from './Theme'
import { DropdownProvider } from './DropdownContext'
import { I18nProvider } from './I18n'
import { HeaderThemeProvider } from './HeaderTheme'
import { Analytics } from '@/components/Analytics'
import type { SiteConfig } from '@/payload-types'

interface ProvidersProps {
  children: React.ReactNode
  lang: string
  siteConfig: SiteConfig | null
}

export function Providers({ children, lang, siteConfig }: ProvidersProps) {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <DropdownProvider>
          <I18nProvider defaultLang={lang}>
            {siteConfig && <Analytics config={siteConfig} />}
            {children}
          </I18nProvider>
        </DropdownProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
