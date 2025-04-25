'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import CalendlyBooking from '@/components/chat/CalendlyBooking'
import AdditionalInfoForm from '@/components/services/AdditionalInfoForm'
import type { BookingSettings, AdditionalInfoField } from '@/types/service'

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
}

export const ServiceBookingFlow: React.FC<ServiceBookingFlowProps> = ({
  serviceId,
  price,
  currency = 'USD',
  requiresBooking = false,
  bookingSettings,
  prefill,
  className = '',
  orderId: initialOrderId,
  skipPayment = false,
}) => {
  const t = useTranslations('ServiceBooking')
  const [step, setStep] = useState<'payment' | 'additionalInfo' | 'booking' | 'complete'>('payment')
  const [additionalInfo, setAdditionalInfo] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(initialOrderId || null)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(!requiresBooking)

  // Если указано пропустить шаг оплаты, сразу переходим к следующему шагу
  useEffect(() => {
    if (skipPayment && orderId) {
      setPaymentVerified(true)

      // Проверяем, нужно ли собирать дополнительную информацию
      if (
        bookingSettings?.enableAdditionalInfo &&
        bookingSettings.additionalInfoFields?.length > 0
      ) {
        setStep('additionalInfo')
      } else if (requiresBooking) {
        setStep('booking')
      } else {
        setStep('complete')
        setBookingComplete(true)
      }
    }
  }, [skipPayment, orderId, bookingSettings, requiresBooking])

  // Проверяем статус оплаты, если есть orderId и не пропускаем шаг оплаты
  useEffect(() => {
    if (orderId && !paymentVerified && !skipPayment) {
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`/api/v1/services/payment/verify?orderId=${orderId}`)
          if (!response.ok) {
            throw new Error('Failed to verify payment status')
          }

          const data = await response.json()
          if (data.verified) {
            setPaymentVerified(true)

            // Проверяем, нужно ли собирать дополнительную информацию
            if (
              bookingSettings?.enableAdditionalInfo &&
              bookingSettings.additionalInfoFields?.length > 0
            ) {
              setStep('additionalInfo')
            } else if (!requiresBooking) {
              // Если не требуется бронирование, переходим к завершению
              setStep('complete')
            } else {
              // Иначе переходим к бронированию
              setStep('booking')
            }
          }
        } catch (err) {
          console.error('Error verifying payment:', err)
        }
      }

      // Проверяем сразу и затем каждые 5 секунд
      checkPaymentStatus()
      const interval = setInterval(checkPaymentStatus, 5000)

      return () => clearInterval(interval)
    }
  }, [orderId, paymentVerified, requiresBooking])

  // Обработчик инициализации оплаты
  const handleInitiatePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Создаем заказ и инициируем оплату
      const response = await fetch('/api/v1/services/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          customer: {
            email: prefill?.email || '',
            name: prefill?.name || '',
            locale: 'en', // Можно сделать динамическим
          },
          provider: { id: 'yoomoney' }, // Провайдер по умолчанию, можно сделать настраиваемым
          returnUrl: window.location.href, // Возвращаемся на ту же страницу после оплаты
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Payment initialization failed')
      }

      const data = await response.json()

      // Сохраняем ID заказа для проверки
      setOrderId(data.orderId)

      // Перенаправляем на страницу оплаты
      window.location.href = data.paymentUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчик отправки формы дополнительной информации
  const handleAdditionalInfoSubmit = async (data: Record<string, any>) => {
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
    bookingSettings.additionalInfoFields?.length > 0
  ) {
    return (
      <div className={className}>
        <Alert className="mb-4">
          <AlertDescription>{t('paymentComplete')}</AlertDescription>
        </Alert>

        <AdditionalInfoForm
          fields={bookingSettings.additionalInfoFields as AdditionalInfoField[]}
          title={bookingSettings.additionalInfoTitle || t('additionalInfoTitle')}
          description={bookingSettings.additionalInfoDescription || t('additionalInfoDescription')}
          isRequired={bookingSettings.additionalInfoRequired || false}
          onSubmit={handleAdditionalInfoSubmit}
          onSkip={!bookingSettings.additionalInfoRequired ? handleAdditionalInfoSkip : undefined}
          className="mt-4"
        />
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
                                acc[field.fieldLabel] = new Date(value).toLocaleDateString()
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
      <div className="p-6 border rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-2">{t('paymentTitle')}</h3>
        <p className="mb-4">{t('paymentDescription')}</p>

        <div className="flex justify-between items-center mb-6">
          <span className="font-medium">{t('price')}</span>
          <span className="text-xl font-bold">
            {price} {currency}
          </span>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleInitiatePayment} disabled={isLoading} className="w-full">
          {isLoading ? t('processing') : t('payNow')}
        </Button>
      </div>
    </div>
  )
}

export default ServiceBookingFlow
