import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Metadata } from 'next'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { CheckCircle } from 'lucide-react'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = params
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  return {
    title: currentLocale === 'ru' ? 'Вы отписались от рассылки' : 'You have unsubscribed',
    description:
      currentLocale === 'ru'
        ? 'Вы успешно отписались от нашей новостной рассылки'
        : 'You have successfully unsubscribed from our newsletter',
  }
}

export default function UnsubscribedPage({ params }: Props) {
  const { lang } = params
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale
  
  const texts = {
    title: currentLocale === 'ru' ? 'Вы отписались от рассылки' : 'You have unsubscribed',
    description: currentLocale === 'ru'
      ? 'Вы успешно отписались от нашей новостной рассылки. Мы сожалеем, что вы уходите, но благодарим за то время, что были с нами.'
      : 'You have successfully unsubscribed from our newsletter. We\'re sorry to see you go, but thank you for being with us.',
    homeButton: currentLocale === 'ru' ? 'Вернуться на главную' : 'Return to homepage',
    subscribeAgain: currentLocale === 'ru' ? 'Подписаться снова' : 'Subscribe again',
  }

  return (
    <div className="container max-w-3xl px-4 py-12 md:py-20">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{texts.title}</h1>
        
        <p className="text-muted-foreground mb-8">
          {texts.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href={`/${currentLocale}`}>
              {texts.homeButton}
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href={`/${currentLocale}/subscribe`}>
              {texts.subscribeAgain}
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
} 