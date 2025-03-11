import { headers } from 'next/headers'

type Locale = 'en' | 'ru' | 'all'

export async function getCurrentLocale(): Promise<Locale> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const locale = pathname.split('/')[1]
  return (locale || 'ru') as Locale
}
