'use client'

import { Analytics } from '@/components/Analytics'
import { ThemeProvider } from '@/providers/Theme'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { DropdownProvider } from '@/providers/DropdownContext'
import { I18nProvider } from '@/providers/I18n'
import { Toaster } from 'sonner'
import { PayloadAPIProvider } from '@/providers/payload'
import { AuthProvider } from '@/providers/AuthProvider'
import { NotificationsProvider } from '@/providers/NotificationsProvider'
import { CartProvider } from './CartProvider'
import { CheckoutProvider } from './CheckoutProvider'
import { FavoritesProvider } from './FavoritesProvider'
import { UserPreferencesProvider } from './UserPreferencesProvider'
import { CacheProvider } from './CacheProvider'
import { BlogProvider } from './BlogProvider'
import { SearchProvider } from './SearchProvider'
import { LocaleProvider } from './LocaleProvider'
import { AnalyticsProvider } from './AnalyticsProvider'
import { PermissionsProvider } from './PermissionsProvider'
import { MediaQueryProvider } from './MediaQueryProvider'
import { FormProvider } from './FormProvider'
import { ErrorProvider } from './ErrorProvider'
import { FeatureFlagsProvider } from './FeatureFlagsProvider'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

interface RootProviderProps {
  children: React.ReactNode
  lang: string
}

export function RootProvider({ children, lang }: RootProviderProps) {
  // Use all context providers in a nested structure
  // The order matters - providers that depend on others should be nested inside them
  return (
    <CacheProvider>
      <ErrorProvider showToasts={true} logToConsole={true}>
        <MediaQueryProvider>
          <DropdownProvider>
            <ThemeProvider>
              {/* Legacy I18n provider for backward compatibility */}
              <I18nProvider defaultLang={lang}>
                {/* Enhanced locale provider with additional functionality */}
                <LocaleProvider initialLocale={(lang as Locale) || DEFAULT_LOCALE}>
                  <HeaderThemeProvider>
                    <AuthProvider>
                      <PermissionsProvider>
                        <FeatureFlagsProvider>
                          <UserPreferencesProvider>
                            <NotificationsProvider>
                              <CartProvider locale={lang as Locale}>
                                <CheckoutProvider>
                                  <FavoritesProvider>
                                    <PayloadAPIProvider>
                                      <AnalyticsProvider>
                                        <FormProvider>
                                          {/* New providers for blog and search functionality */}
                                          <BlogProvider>
                                            <SearchProvider>{children}</SearchProvider>
                                          </BlogProvider>
                                        </FormProvider>
                                      </AnalyticsProvider>
                                      <Toaster
                                        position="top-right"
                                        toastOptions={{ className: 'toast-offset' }}
                                      />
                                    </PayloadAPIProvider>
                                  </FavoritesProvider>
                                </CheckoutProvider>
                              </CartProvider>
                            </NotificationsProvider>
                          </UserPreferencesProvider>
                        </FeatureFlagsProvider>
                      </PermissionsProvider>
                    </AuthProvider>
                  </HeaderThemeProvider>
                </LocaleProvider>
              </I18nProvider>
            </ThemeProvider>
          </DropdownProvider>
        </MediaQueryProvider>
      </ErrorProvider>
    </CacheProvider>
  )
}
