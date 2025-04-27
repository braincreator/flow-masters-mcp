import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { SupportForm } from '@/components/support/SupportForm'
import { SupportFAQ } from '@/components/support/SupportFAQ'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'Support' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function SupportPage({ params }: Props) {
  const { lang } = await Promise.resolve(params)
  setRequestLocale(lang)
  const t = await getTranslations({ locale: lang, namespace: 'Support' })

  return (
    <div className="container max-w-screen-xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-hidden">
          <div className="h-2 bg-blue-500" />
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('contactMethods.chat.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('contactMethods.chat.description')}</p>
            <Button asChild>
              <Link href={`/${lang}/chat`}>{t('contactMethods.chat.button')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-2 bg-purple-500" />
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('contactMethods.email.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('contactMethods.email.description')}</p>
            <Button variant="outline" asChild>
              <a href="mailto:support@flowmasters.com">{t('contactMethods.email.button')}</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-2 bg-green-500" />
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('contactMethods.phone.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('contactMethods.phone.description')}</p>
            <Button variant="outline" asChild>
              <a href="tel:+1234567890">{t('contactMethods.phone.button')}</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SupportForm locale={lang} />
        </div>
        <div>
          <SupportFAQ locale={lang} />
        </div>
      </div>
    </div>
  )
}
