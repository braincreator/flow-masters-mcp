'use client'

import React, { useState, useEffect, FormEvent, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation' // Added for redirection
import { useCart } from '@/providers/CartProvider' // Используем хук для обновления корзины
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CalendlyBooking from '@/components/chat/CalendlyBooking'
import AdditionalInfoForm from '@/components/services/AdditionalInfoForm'
import type { BookingSettings, AdditionalInfoField } from '@/types/service'
import ServicePrice from '@/components/services/ServicePrice'
// import type { Locale } from '@/config/i18n.config' // Assuming you have a Locale type - Commenting out due to error

// Define Locale type based on linter error
export type Locale = 'en' | 'ru'

type ServiceBookingFlowProps = {
  serviceId: string
  price: number
  currency?: string
  requiresBooking?: boolean
  bookingSettings?: BookingSettings
  prefill?: {
    name?: string
    email?: string
    customAnswers?: Record<string, string>
  }
  className?: string
  orderId?: string
  skipPayment?: boolean
  locale: Locale // Use the defined Locale type
}

export const ServiceBookingFlow: React.FC<ServiceBookingFlowProps> = ({
  serviceId,
  price,
  currency,
  requiresBooking = false,
  bookingSettings,
  prefill,
  className = '',
  orderId: initialOrderId,
  skipPayment = false,
  locale, // locale is now of type Locale ('en' | 'ru')
}) => {
  const t = useTranslations('ServiceBooking')
  const router = useRouter()
  const { addItem, refreshCart, emptyCart } = useCart() // Используем все необходимые методы из хука

  const [step, setStep] = useState<'payment' | 'additionalInfo' | 'booking' | 'complete'>(
    skipPayment && initialOrderId
      ? (bookingSettings?.enableAdditionalInfo && bookingSettings.additionalInfoFields?.length) ||
        0 > 0
        ? 'additionalInfo'
        : requiresBooking
          ? 'booking'
          : 'complete'
      : 'payment',
  )
  const [additionalInfo, setAdditionalInfo] = useState<Record<
    string,
    string | number | boolean | Date
  > | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(initialOrderId || null) // Retain for potential post-checkout booking flow
  const [paymentVerified, setPaymentVerified] = useState(skipPayment || false) // If skipping payment, assume verified
  const [bookingComplete, setBookingComplete] = useState(!requiresBooking && skipPayment)
  const [customerEmail, setCustomerEmail] = useState(prefill?.email || '')
  const [emailError, setEmailError] = useState<string | null>(null)

  // This useEffect might still be relevant if the flow can be re-entered after payment
  // For now, its direct payment verification logic is superseded by the main checkout page.
  useEffect(() => {
    if (orderId && !paymentVerified && !skipPayment) {
      // Logic to check if orderId is paid (e.g. if user returns to this flow)
      // This might involve checking the order status via an API if this component
      // is re-mounted after payment on the main checkout page.
      // For this task, we assume the main checkout handles payment verification.
      // If payment is successful, the user might be redirected back here with an orderId.
      // In such a case, we might want to setPaymentVerified(true) based on order status.
      console.log(
        `ServiceBookingFlow: Order ID ${orderId} present, payment verification would happen here if re-entering flow.`,
      )
    }
  }, [orderId, paymentVerified, skipPayment])

  const handleInitiateCheckout = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault()
    setEmailError(null)

    const emailToUse = prefill?.email || customerEmail

    if (!emailToUse) {
      setEmailError(t('emailRequiredError'))
      return
    }
    if (!/\S+@\S+\.\S+/.test(emailToUse)) {
      setEmailError(t('emailInvalidError'))
      return
    }

    if (!serviceId) {
      setError('Ошибка: ID услуги не указан')
      return
    }

    console.log('ServiceBookingFlow: Attempting to add to cart:', {
      serviceId,
      type: 'service',
      locale,
    })

    setIsLoading(true)
    setError(null)

    try {
      // Очищаем корзину перед добавлением новой услуги, чтобы избежать конфликтов
      if (typeof emptyCart === 'function') {
        await emptyCart()
        console.log('ServiceBookingFlow: Cart cleared before adding new service.')
      } else {
        // Этого не должно произойти, если useCart предоставляет emptyCart
        console.warn('ServiceBookingFlow: emptyCart function is not available from useCart.')
      }

      // Последовательные шаги для гарантированного добавления в корзину
      console.log('ServiceBookingFlow: 1. Calling addItem with params:', serviceId, 'service', 1)
      await addItem(serviceId, 'service', 1)

      console.log('ServiceBookingFlow: 2. Explicitly refreshing cart')
      await refreshCart()

      // Проверка данных корзины
      console.log('ServiceBookingFlow: 3. Waiting for state to settle')
      await new Promise((resolve) => setTimeout(resolve, 800))

      console.log('ServiceBookingFlow: 4. Redirect preparation complete, redirecting to checkout')

      // Сохраняем ID услуги в sessionStorage для дополнительной проверки при загрузке чекаута
      sessionStorage.setItem('last_added_service', serviceId)

      // Сохраняем email пользователя для автозаполнения на странице чекаута
      if (emailToUse) {
        sessionStorage.setItem('checkout_email', emailToUse)
      }

      // Используем window.location для полной перезагрузки страницы
      window.location.href = `/${locale}/checkout`
    } catch (err) {
      console.error('ServiceBookingFlow: Error adding to cart:', err)
      setError(err instanceof Error ? err.message : 'Failed to add service to cart or redirect.')
      setIsLoading(false) // Ensure loading is stopped on error
    }
  }

  // Обработчик отправки формы дополнительной информации
  const handleAdditionalInfoSubmit = async (
    data: Record<string, string | number | boolean | Date>,
  ) => {
    try {
      setAdditionalInfo(data)

      // Сохраняем дополнительную информацию в базе данных
      if (orderId) {
        await fetch(`/api/v1/services/booking/additional-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            serviceId,
            additionalInfo: data,
          }),
        })
      }

      // Переходим к следующему шагу
      if (requiresBooking) {
        setStep('booking')
      } else {
        setStep('complete')
        setBookingComplete(true)
      }
    } catch (error) {
      console.error('Error saving additional info:', error)
    }
  }

  // Обработчик пропуска формы дополнительной информации
  const handleAdditionalInfoSkip = () => {
    if (requiresBooking) {
      setStep('booking')
    } else {
      setStep('complete')
      setBookingComplete(true)
    }
  }

  // Обработчик завершения бронирования
  const handleBookingComplete = () => {
    setBookingComplete(true)
    setStep('complete')
  }

  // Если нужно собрать дополнительную информацию
  if (
    step === 'additionalInfo' &&
    bookingSettings?.enableAdditionalInfo &&
    (bookingSettings.additionalInfoFields?.length || 0) > 0
  ) {
    return (
      <div className={className}>
        <Alert className="mb-4">
          <AlertDescription>{t('paymentComplete')}</AlertDescription>
        </Alert>

        {bookingSettings && (
          <AdditionalInfoForm
            fields={bookingSettings.additionalInfoFields as AdditionalInfoField[]}
            title={bookingSettings.additionalInfoTitle || t('additionalInfoTitle')}
            description={
              bookingSettings.additionalInfoDescription || t('additionalInfoDescription')
            }
            isRequired={bookingSettings.additionalInfoRequired || false}
            onSubmit={handleAdditionalInfoSubmit}
            onSkip={!bookingSettings.additionalInfoRequired ? handleAdditionalInfoSkip : undefined}
            className="mt-4"
          />
        )}
      </div>
    )
  }

  // Если оплата подтверждена и требуется бронирование, показываем виджет бронирования
  if (step === 'booking' && requiresBooking && bookingSettings) {
    return (
      <div className={className}>
        <Alert className="mb-4">
          <AlertDescription>{t('paymentComplete')}</AlertDescription>
        </Alert>

        {bookingSettings.provider === 'calendly' &&
          bookingSettings.calendlyUsername &&
          bookingSettings.calendlyEventType && (
            <div>
              <h3 className="text-lg font-medium mb-4">{t('bookingTitle')}</h3>
              <p className="mb-4">{t('bookingDescription')}</p>

              <CalendlyBooking
                username={bookingSettings.calendlyUsername}
                eventType={bookingSettings.calendlyEventType}
                hideEventTypeDetails={bookingSettings.hideEventTypeDetails}
                hideGdprBanner={bookingSettings.hideGdprBanner}
                prefill={{
                  ...prefill,
                  customAnswers: additionalInfo
                    ? // Фильтруем поля, которые нужно отправить в Calendly
                      Object.entries(additionalInfo)
                        .filter(([key, _]) => {
                          const field = bookingSettings.additionalInfoFields?.find(
                            (f) => f.fieldName === key,
                          )
                          return field?.sendToCalendly !== false
                        })
                        .reduce(
                          (acc, [key, value]) => {
                            // Преобразуем значения в строки для Calendly
                            const field = bookingSettings.additionalInfoFields?.find(
                              (f) => f.fieldName === key,
                            )
                            if (field) {
                              if (field.fieldType === 'checkbox') {
                                acc[field.fieldLabel] = value ? 'Да' : 'Нет'
                              } else if (field.fieldType === 'date' && value) {
                                // Проверяем, что value - это объект Date
                                if (value instanceof Date) {
                                  acc[field.fieldLabel] = value.toLocaleDateString()
                                } else {
                                  // Если это строка или число, преобразуем в Date
                                  acc[field.fieldLabel] = new Date(
                                    value as string | number,
                                  ).toLocaleDateString()
                                }
                              } else {
                                acc[field.fieldLabel] = String(value)
                              }
                            }
                            return acc
                          },
                          {} as Record<string, string>,
                        )
                    : undefined,
                }}
                className="mb-4"
                onEventScheduled={handleBookingComplete}
              />
            </div>
          )}

        {bookingSettings.provider !== 'calendly' && (
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">{t('bookingTitle')}</h3>
            <p className="mb-4">{t('bookingDescription')}</p>
            <Button onClick={handleBookingComplete} className="w-full">
              {t('completeBooking')}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Если все шаги завершены, показываем сообщение о завершении
  if (step === 'complete' || (paymentVerified && bookingComplete)) {
    return (
      <div className={className}>
        <div className="p-6 border rounded-lg shadow-sm bg-green-50">
          <h3 className="text-lg font-medium mb-2 text-green-700">{t('successTitle')}</h3>
          <p className="mb-4 text-green-600">{t('successDescription')}</p>

          {orderId && (
            <p className="text-sm text-green-600 mb-4">
              {t('orderNumber')}: <span className="font-medium">{orderId}</span>
            </p>
          )}

          <Button
            onClick={() => (window.location.href = '/account/orders')}
            variant="outline"
            className="w-full"
          >
            {t('viewOrders')}
          </Button>
        </div>
      </div>
    )
  }

  // В противном случае показываем шаг оплаты
  return (
    <div className={className}>
      <form onSubmit={handleInitiateCheckout} className="p-6 border rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-2">{t('paymentTitle')}</h3>
        <p className="mb-4">{t('paymentDescription')}</p>

        {!prefill?.email && (
          <div className="mb-4">
            <Label htmlFor="customer-email" className="mb-1 block">
              {t('emailLabel')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value)
                if (emailError) setEmailError(null)
              }}
              placeholder={t('emailPlaceholder')}
              required
              className={emailError ? 'border-red-500' : ''}
            />
            {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <span className="font-medium">{t('price')}</span>
          <span className="text-xl font-bold">
            <ServicePrice price={price || 0} locale={locale} />
          </span>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {/* Changed button text to reflect adding to cart and proceeding to checkout */}
          {isLoading ? t('processing') : t('addToCartAndCheckout')}
        </Button>
      </form>
    </div>
  )
}

export default ServiceBookingFlow
