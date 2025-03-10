'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

const locales = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = useCallback(
    (locale: string) => {
      const currentPathParts = pathname.split('/')
      // Replace the language code (second part of the path) with the new locale
      currentPathParts[1] = locale
      const newPath = currentPathParts.join('/')
      router.push(newPath)
    },
    [pathname, router],
  )

  const currentLocale = pathname.split('/')[1]

  return (
    <div className="flex items-center gap-4">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLanguage(code)}
          className={`px-2 py-1 rounded ${
            currentLocale === code ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
