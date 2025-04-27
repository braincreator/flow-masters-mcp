import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { UserCertificates } from '@/components/certificates/UserCertificates'
import { AuthCheck } from '@/components/auth/AuthCheck'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'Certificates' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function CertificatesPage({ params }: Props) {
  const { lang } = await Promise.resolve(params)
  setRequestLocale(lang)

  return (
    <div className="container max-w-screen-xl mx-auto py-8">
      <AuthCheck locale={lang} redirectTo={`/${lang}/login?redirect=${encodeURIComponent(`/${lang}/certificates`)}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{lang === 'ru' ? 'Сертификаты' : 'Certificates'}</h1>
          <p className="text-muted-foreground mt-2">
            {lang === 'ru' 
              ? 'Управляйте своими сертификатами и достижениями' 
              : 'Manage your certificates and credentials'}
          </p>
        </div>
        <UserCertificates locale={lang} />
      </AuthCheck>
    </div>
  )
}
