import { SUPPORTED_LOCALES } from '@/constants'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ lang: locale }))
}
