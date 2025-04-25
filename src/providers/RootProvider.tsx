'use client'

import { Analytics } from '@/components/Analytics'
import { ThemeProvider } from '@/providers/Theme'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { DropdownProvider } from '@/providers/DropdownContext'
import { I18nProvider } from '@/providers/I18n'
import { Toaster } from 'sonner'
import { PayloadAPIProvider } from '@/providers/payload'
import { CurrencyProvider } from './CurrencyProvider'
import { NextIntlClientProvider } from 'next-intl'
import { useMessages } from 'next-intl'
import { AuthProvider } from '@/providers/AuthProvider'

interface RootProviderProps {
  children: React.ReactNode
  lang: string
}

export function RootProvider({ children, lang }: RootProviderProps) {
  // Используем существующий провайдер I18n для обратной совместимости
  // и добавляем NextIntlClientProvider для нового функционала
  return (
    <DropdownProvider>
      <ThemeProvider>
        <I18nProvider defaultLang={lang}>
          <HeaderThemeProvider>
            <AuthProvider>
              <PayloadAPIProvider>
                <CurrencyProvider>{children}</CurrencyProvider>
                <Toaster position="top-right" toastOptions={{ className: 'toast-offset' }} />
              </PayloadAPIProvider>
            </AuthProvider>
          </HeaderThemeProvider>
        </I18nProvider>
      </ThemeProvider>
    </DropdownProvider>
  )
}
