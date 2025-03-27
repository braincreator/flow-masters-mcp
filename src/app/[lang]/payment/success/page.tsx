'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useParams } from 'next/navigation'
import { Locale } from '@/constants'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const { lang } = useParams()
  const locale = lang as Locale

  const [isLoading, setIsLoading] = useState(true)
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string; status: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const orderId = searchParams.get('orderId')
  const provider = searchParams.get('provider')

  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (!orderId) {
        setIsLoading(false)
        setError(locale === 'ru' ? 'Идентификатор заказа не найден' : 'Order ID not found')
        return
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(
            locale === 'ru'
              ? 'Не удалось загрузить информацию о заказе'
              : 'Failed to load order information',
          )
        }

        const data = await response.json()
        setOrderInfo({
          orderNumber: data.orderNumber,
          status: data.status,
        })
      } catch (error) {
        console.error('Error loading order:', error)
        setError(
          locale === 'ru'
            ? 'Произошла ошибка при загрузке заказа'
            : 'An error occurred while loading order information',
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderInfo()
  }, [orderId, locale])

  const getStatusMessage = () => {
    if (!orderInfo) return ''

    if (orderInfo.status === 'paid' || orderInfo.status === 'processing') {
      return locale === 'ru'
        ? 'Ваш платеж был успешно обработан'
        : 'Your payment has been successfully processed'
    }

    return locale === 'ru'
      ? 'Ваш заказ был размещен. Статус платежа будет обновлен в ближайшее время.'
      : 'Your order has been placed. Payment status will be updated shortly.'
  }

  return (
    <div className="container max-w-md py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : orderInfo ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">
                {locale === 'ru' ? 'Спасибо за ваш заказ!' : 'Thank you for your order!'}
              </CardTitle>
            </>
          ) : (
            <CardTitle className="text-xl text-red-500">
              {error || (locale === 'ru' ? 'Что-то пошло не так' : 'Something went wrong')}
            </CardTitle>
          )}
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {!isLoading && orderInfo && (
            <>
              <p className="text-muted-foreground">{getStatusMessage()}</p>
              <div className="bg-muted rounded-md p-4">
                <p>
                  <span className="font-medium">
                    {locale === 'ru' ? 'Номер заказа: ' : 'Order number: '}
                  </span>
                  {orderInfo.orderNumber}
                </p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={`/${locale}`} className="flex items-center">
              {locale === 'ru' ? 'На главную' : 'Back to home'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
