import { Locale } from '@/constants'
import PaymentSuccessClient from './PaymentSuccessClient'

interface PaymentSuccessPageProps {
  params: {
    lang: Locale
  }
  searchParams: {
    order?: string
  }
}

export async function generateMetadata({ params: { lang } }: PaymentSuccessPageProps) {
  const title = lang === 'ru' ? 'Оплата успешно завершена' : 'Payment Successful'
  const description =
    lang === 'ru'
      ? 'Ваш заказ успешно оплачен и обрабатывается'
      : 'Your order has been successfully paid and is being processed'

  return {
    title,
    description,
  }
}

export default function PaymentSuccessPage({
  params: { lang },
  searchParams,
}: PaymentSuccessPageProps) {
  const orderId = searchParams.order || '0000000'

  return (
    <div className="container max-w-4xl py-12">
      <PaymentSuccessClient locale={lang} orderId={orderId} />
    </div>
  )
}
