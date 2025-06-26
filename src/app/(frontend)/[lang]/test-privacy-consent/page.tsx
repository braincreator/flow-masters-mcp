import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { PrivacyConsentTestClient } from './PrivacyConsentTestClient'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'forms.privacyConsent' })

  return {
    title: `Privacy Consent Test - ${lang}`,
    description: 'Test page for privacy consent forms compliance',
  }
}

export default async function TestPrivacyConsentPage({ params }: Props) {
  const { lang } = await Promise.resolve(params)
  setRequestLocale(lang)

  return (
    <div className="container max-w-screen-xl mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Privacy Consent Forms Test</h1>
          <p className="text-muted-foreground">
            Тестирование всех форм с согласием на обработку персональных данных
          </p>
        </div>

        <PrivacyConsentTestClient locale={lang} />
      </div>
    </div>
  )
}
