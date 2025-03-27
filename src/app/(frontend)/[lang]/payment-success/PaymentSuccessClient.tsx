'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, Download, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Locale } from '@/constants'
import { useCart } from '@/hooks/useCart'

interface PaymentSuccessClientProps {
  locale: Locale
  orderId: string
}

export default function PaymentSuccessClient({ locale, orderId }: PaymentSuccessClientProps) {
  const { items, clearCart } = useCart()

  // Clear cart on successful payment
  useEffect(() => {
    // Wait a bit to clear the cart so the user can see what was purchased
    const timer = setTimeout(() => {
      clearCart()
    }, 500)

    return () => clearTimeout(timer)
  }, [clearCart])

  const texts = {
    title: locale === 'ru' ? 'Оплата прошла успешно!' : 'Payment Successful!',
    subtitle: locale === 'ru' ? 'Спасибо за ваш заказ' : 'Thank you for your order',
    orderInfo: locale === 'ru' ? `Номер заказа: ${orderId}` : `Order ID: ${orderId}`,
    emailInfo:
      locale === 'ru'
        ? 'Мы отправили информацию о заказе и ссылки для скачивания на ваш email'
        : 'We have sent your order details and download links to your email',
    downloadButton: locale === 'ru' ? 'Скачать товары' : 'Download Products',
    homeButton: locale === 'ru' ? 'Вернуться на главную' : 'Back to Home',
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-primary"
      >
        <CheckCircle2 size={80} strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center mb-2">{texts.title}</h1>
        <p className="text-xl text-center text-muted-foreground mb-8">{texts.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center font-medium">{texts.orderInfo}</div>
              <div className="text-center text-muted-foreground text-sm">{texts.emailInfo}</div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" asChild>
              <Link
                href={`/${locale}/downloads`}
                className="flex items-center justify-center gap-2"
              >
                <Download size={18} />
                {texts.downloadButton}
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href={`/${locale}`} className="flex items-center justify-center gap-2">
                <Home size={18} />
                {texts.homeButton}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
