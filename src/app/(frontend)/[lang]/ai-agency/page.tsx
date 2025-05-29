import { AIAgencyLanding } from './components/AIAgencyLanding'
import { setRequestLocale } from 'next-intl/server'

interface AIAgencyPageProps {
  params: Promise<{
    lang: 'en' | 'ru'
  }>
}

export default async function AIAgencyPage({ params }: AIAgencyPageProps) {
  const { lang } = await params
  setRequestLocale(lang)

  return <AIAgencyLanding />
}
