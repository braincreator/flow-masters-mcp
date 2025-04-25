import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'auth.forgotPassword' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { lang } = await Promise.resolve(params)
  setRequestLocale(lang)
  
  const t = await getTranslations({ locale: lang, namespace: 'auth.forgotPassword' })

  return (
    <div className="container max-w-screen-xl mx-auto py-12 flex flex-col items-center justify-center flex-grow">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('description')}</p>
        </div>
        <ForgotPasswordForm locale={lang} />
      </div>
    </div>
  )
}
