import { Locale } from '@/constants'
import { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

interface CheckoutPageProps {
  params: {
    lang: Locale
  }
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const title = params.lang === 'ru' ? 'Оформление заказа' : 'Checkout'

  return {
    title,
    description:
      params.lang === 'ru'
        ? 'Оформление и оплата заказа цифровых товаров'
        : 'Complete your order for digital products',
  }
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {params.lang === 'ru' ? 'Оформление заказа' : 'Checkout'}
        </h1>

        <CheckoutClient locale={params.lang} />
      </div>
    </div>
  )
}
