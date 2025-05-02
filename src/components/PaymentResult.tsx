'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Locale } from '@/constants' // Assuming Locale type exists

export interface PaymentResultProps { // Add export here
  success: boolean
  orderId?: string | null
  transactionId?: string | null
  successTitle?: string
  successMessage?: string
  errorTitle?: string
  errorMessage?: string
  locale: Locale // Pass locale for translations
}

export default function PaymentResult({
  success,
  orderId,
  transactionId,
  successTitle,
  successMessage,
  errorTitle,
  errorMessage,
  locale,
}: PaymentResultProps) {
  const t = useTranslations('PaymentResult') // Assuming 'PaymentResult' namespace in translation files

  const title = success
    ? successTitle || t('successTitle')
    : errorTitle || t('errorTitle')
  const message = success
    ? successMessage || t('successMessageDefault')
    : errorMessage || t('errorMessageDefault')

  return (
    <Card className={`border-${success ? 'green' : 'destructive'}-500`}>
      <CardHeader className="text-center">
        {success ? (
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        ) : (
          <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
        )}
        <CardTitle className={`text-2xl font-bold ${success ? 'text-green-600' : 'text-destructive'}`}>
          {title}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {orderId && (
          <p className="text-sm text-muted-foreground">
            {t('orderIdLabel')}: <span className="font-medium">{orderId}</span>
          </p>
        )}
        {transactionId && (
          <p className="text-sm text-muted-foreground">
            {t('transactionIdLabel')}: <span className="font-medium">{transactionId}</span>
          </p>
        )}
        <div className="flex justify-center gap-4 mt-6">
          {success ? (
            <Button asChild>
              <Link href={`/${locale}/user/orders`}>{t('viewOrdersButton')}</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href={`/${locale}/cart`}>{t('returnToCartButton')}</Link>
            </Button>
          )}
          <Button variant="secondary" asChild>
            <Link href={`/${locale}`}>{t('continueShoppingButton')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}