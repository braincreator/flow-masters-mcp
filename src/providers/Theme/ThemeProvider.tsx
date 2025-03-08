'use client'

import Script from 'next/script'
import React from 'react'

import { defaultTheme, themeLocalStorageKey } from './ThemeSelector/types'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              try {
                function getImplicitPreference() {
                  var mediaQuery = '(prefers-color-scheme: dark)'
                  var mql = window.matchMedia(mediaQuery)
                  var hasImplicitPreference = typeof mql.matches === 'boolean'

                  if (hasImplicitPreference) {
                    return mql.matches ? 'dark' : 'light'
                  }

                  return null
                }

                function themeIsValid(theme) {
                  return theme === 'light' || theme === 'dark'
                }

                var themeToSet = '${defaultTheme}'
                var preference = window.localStorage.getItem('${themeLocalStorageKey}')

                if (themeIsValid(preference)) {
                  themeToSet = preference
                } else {
                  var implicitPreference = getImplicitPreference()

                  if (implicitPreference) {
                    themeToSet = implicitPreference
                  }
                }

                document.documentElement.setAttribute('data-theme', themeToSet)
              } catch (e) {
                // If we're on the server or there's an error, set the default theme
                document.documentElement.setAttribute('data-theme', '${defaultTheme}')
              }
            })();
          `,
        }}
        id="theme-script"
      />
      {children}
    </>
  )
}
