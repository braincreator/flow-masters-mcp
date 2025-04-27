import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { Container } from '@/components/ui/container'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ErrorButtonWrapper } from '@/components/shared/ErrorButtonWrapper'

interface Props {
  params: {
    lang: string
  }
  searchParams: {
    email?: string
    token?: string // Added token parameter
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'auth' })

  return {
    title: t('resetPassword.title'),
    description: t('resetPassword.description'),
  }
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { lang } = await Promise.resolve(params)
  const { token } = searchParams

  setRequestLocale(lang)

  const t = await getTranslations({ locale: lang, namespace: 'auth' })

  return (
    <Container>
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t('resetPassword.title')}</h1>
            <p className="mt-2 text-sm text-gray-600">{t('resetPassword.description')}</p>
          </div>

          <ErrorBoundary
            fallback={
              <ErrorButtonWrapper label={t('resetPassword.errors.resetError')} locale={lang} />
            }
          >
            <ResetPasswordForm token={token || ''} locale={lang} />
          </ErrorBoundary>
        </div>
      </div>
    </Container>
  )
}
