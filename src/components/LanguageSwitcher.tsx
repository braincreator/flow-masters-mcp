'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const locales = ['en', 'ru']

export function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname()
  const currentPath = pathname.replace(`/${currentLang}`, '')

  return (
    <div className="flex gap-2">
      {locales.map((locale) => {
        const isActive = locale === currentLang
        return (
          <Link
            key={locale}
            href={`/${locale}${currentPath}`}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {locale.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}
