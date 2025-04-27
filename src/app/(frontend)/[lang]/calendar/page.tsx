import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { UserCalendar } from '@/components/calendar/UserCalendar'
import { AuthCheck } from '@/components/auth/AuthCheck'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'Calendar' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function CalendarPage({ params }: Props) {
  const { lang } = await Promise.resolve(params)
  setRequestLocale(lang)

  return (
    <div className="container max-w-screen-xl mx-auto py-8">
      <AuthCheck locale={lang} redirectTo={`/${lang}/login?redirect=${encodeURIComponent(`/${lang}/calendar`)}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{lang === 'ru' ? 'Расписание' : 'Schedule'}</h1>
          <p className="text-muted-foreground mt-2">
            {lang === 'ru' 
              ? 'Управляйте своими событиями и расписанием' 
              : 'Manage your events and schedule'}
          </p>
        </div>
        <UserCalendar locale={lang} />
      </AuthCheck>
    </div>
  )
}
