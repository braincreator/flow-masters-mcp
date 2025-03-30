import { Locale } from '@/constants'
import { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Payment Failed',
  description: 'Your payment could not be processed',
}

interface PaymentFailurePageProps {
  params: {
    lang: Locale
  }
  searchParams: {
    orderId?: string
    orderNumber?: string
    error?: string
  }
}

export default function PaymentFailurePage({ params, searchParams }: PaymentFailurePageProps) {
  const { lang } = params
  const { orderId, orderNumber, error } = searchParams

  const displayOrderNumber = orderNumber || 'N/A'
  const errorMessage =
    error ||
    (lang === 'ru'
      ? 'При обработке платежа произошла ошибка'
      : 'There was an error processing your payment')

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-4">
          {lang === 'ru' ? 'Ошибка платежа' : 'Payment Failed'}
        </h1>

        <p className="text-gray-600 mb-6">
          {lang === 'ru'
            ? `Оплата заказа #${displayOrderNumber} не была произведена.`
            : `The payment for order #${displayOrderNumber} was not completed.`}
        </p>

        <div className="bg-red-50 p-4 rounded-md mb-6 text-red-700">
          <p className="text-sm">{errorMessage}</p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href={`/${lang}/checkout`}>
              {lang === 'ru' ? 'Попробовать снова' : 'Try again'}
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/${lang}`}>
              {lang === 'ru' ? 'Вернуться на главную' : 'Return to home page'}
            </Link>
          </Button>

          <div className="pt-4 text-sm text-gray-500">
            {lang === 'ru'
              ? 'Если вы считаете, что произошла ошибка, пожалуйста, свяжитесь с нашей службой поддержки.'
              : 'If you believe this is an error, please contact our support team.'}
          </div>
        </div>
      </div>
    </div>
  )
}
