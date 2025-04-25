import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { Container } from '@/components/Container'

interface Props {
  params: {
    lang: string
  }
  searchParams: {
    email?: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'auth' })

  return {
    title: t('resetPassword'),
    description: t('resetPasswordDescription'),
  }
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { lang } = await Promise.resolve(params)
  const { email } = searchParams
  
  setRequestLocale(lang)

  return (
    <Container>
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Сброс пароля</h1>
            <p className="mt-2 text-sm text-gray-600">
              Введите ваш email и новый пароль
            </p>
          </div>
          
          <ResetPasswordForm defaultEmail={email} />
        </div>
      </div>
    </Container>
  )
}
