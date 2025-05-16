import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { PageHeading } from '@/components/PageHeading'
import NotificationsPageWithInfiniteScroll from '@/components/Notifications/NotificationsPageWithInfiniteScroll'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)

  const t = await getTranslations({ locale: lang, namespace: 'Notifications' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function NotificationsPage({ params }: Props) {
  const { lang } = await Promise.resolve(params)

  // Устанавливаем локаль для запроса
  setRequestLocale(lang)

  const t = await getTranslations({ locale: lang, namespace: 'Notifications' })

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 md:px-6">
      <PageHeading title={t('title')} description={t('description')} />
      <NotificationsPageWithInfiniteScroll lang={lang} />
    </div>
  )
}
