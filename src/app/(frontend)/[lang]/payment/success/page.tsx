import { Locale } from '@/constants'
import { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '@/utilities/payload'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Payment Success',
  description: 'Your payment has been processed successfully',
}

interface PaymentSuccessPageProps {
  params: {
    lang: Locale
  }
  searchParams: {
    orderId?: string
    orderNumber?: string
  }
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: PaymentSuccessPageProps) {
  const { lang } = params
  const { orderId, orderNumber } = searchParams

  // If orderId is present, we can fetch order details
  let orderInfo = null
  if (orderId) {
    try {
      const payload = await getPayloadClient()
      const order = await payload.findByID({
        collection: 'orders',
        id: orderId,
      })

      if (order) {
        orderInfo = {
          orderNumber: order.orderNumber,
          total: order.total,
          currency: order.currency,
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    }
  }

  const displayOrderNumber = orderInfo?.orderNumber || orderNumber || 'N/A'

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-4">
          {lang === 'ru' ? 'Оплата успешно выполнена!' : 'Payment Successful!'}
        </h1>

        <p className="text-gray-600 mb-6">
          {lang === 'ru'
            ? `Ваш заказ #${displayOrderNumber} был успешно оплачен. Спасибо за покупку!`
            : `Your order #${displayOrderNumber} has been successfully paid. Thank you for your purchase!`}
        </p>

        {orderInfo && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-500">
              {lang === 'ru' ? 'Сумма заказа' : 'Order total'}:
            </p>
            <p className="font-semibold">
              {orderInfo.total} {orderInfo.currency}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href={`/${lang}/account/orders`}>
              {lang === 'ru' ? 'Перейти к моим заказам' : 'Go to my orders'}
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href={`/${lang}`}>
              {lang === 'ru' ? 'Вернуться на главную' : 'Return to home page'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
