import { Locale } from '@/constants'
import { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

interface CheckoutPageProps {
  params: {
    lang: Locale
  }
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const paramsData = await Promise.resolve(params)
  const lang = paramsData.lang

  const title = lang === 'ru' ? 'Оформление заказа' : 'Checkout'

  return {
    title,
    description:
      lang === 'ru'
        ? 'Оформление и оплата заказа цифровых товаров'
        : 'Complete your order for digital products',
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const paramsData = await Promise.resolve(params)
  const lang = paramsData.lang

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {lang === 'ru' ? 'Оформление заказа' : 'Checkout'}
        </h1>

        <CheckoutClient locale={lang} />
      </div>
    </div>
  )
}
