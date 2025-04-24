import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { AccountDashboard } from '@/components/account/AccountDashboard'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Сначала получаем параметры с помощью await
  const { lang } = await Promise.resolve(params)

  // Затем используем полученный параметр lang
  const t = await getTranslations({ locale: lang, namespace: 'AccountDashboard' })

  return {
    title: t('dashboard.title'),
    description: t('dashboard.description'),
  }
}

export default async function AccountPage({ params }: Props) {
  // Сначала получаем параметры с помощью await
  const { lang } = await Promise.resolve(params)

  // Затем используем полученный параметр lang
  setRequestLocale(lang)

  return (
    <div className="container max-w-screen-xl mx-auto py-12">
      <AccountDashboard locale={lang} />
    </div>
  )
}
