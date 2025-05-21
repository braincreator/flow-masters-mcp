'use client'

import React, { useState, useEffect, FormEvent, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation' // Added for redirection
import { useCart } from '@/providers/CartProvider' // Используем хук для обновления корзины
import { useAuth } from '@/hooks/useAuth' // Import the useAuth hook
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CalendlyBooking from '@/components/chat/CalendlyBooking'
import AdditionalInfoForm from '@/components/services/AdditionalInfoForm'
import type { BookingSettings, AdditionalInfoField } from '@/types/service'
import ServicePrice from '@/components/services/ServicePrice'
import { format } from 'date-fns' // Import format function
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
  const { user, isAuthenticated } = useAuth() // Get user and authentication status

  const [step, setStep] = useState<
    'payment' | 'additionalInfo' | 'booking' | 'complete' | 'preview'
  >(() => {
    // Logic for resuming an order that was already paid (e.g., user navigated away and came back)
    if (skipPayment && initialOrderId) {
      if (bookingSettings?.enableAdditionalInfo && bookingSettings.additionalInfoFields?.length) {
        return 'additionalInfo'
      }
      if (requiresBooking) {
        return 'booking'
      }
      return 'complete'
    }
    // Logic for a new booking where the service itself does not require payment
    if (skipPayment && !initialOrderId) {
      if (bookingSettings?.enableAdditionalInfo && bookingSettings.additionalInfoFields?.length) {
        return 'additionalInfo'
      }
      if (requiresBooking) {
        return 'booking'
      }
      return 'complete'
    }
    // Default case: requires payment
    return 'payment'
  })
  const [additionalInfo, setAdditionalInfo] = useState<Record<
    string,
    string | number | boolean | Date | File[]
  > | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingProvisionalOrder, setIsCreatingProvisionalOrder] = useState(false) // New state
  const [isSubmittingAdditionalInfo, setIsSubmittingAdditionalInfo] = useState(false) // New state for additional info submission
  const [isSubmittingFiles, setIsSubmittingFiles] = useState(false) // State to track file submission progress
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(initialOrderId || null) // Retain for potential post-checkout booking flow
  const [orderNumber, setOrderNumber] = useState<string | null>(null) // Store the formatted order number
  const [projectId, setProjectId] = useState<string | null>(null) // Store the project ID if available
  const [isCheckingProject, setIsCheckingProject] = useState(false) // Track project check status
  const [paymentVerified, setPaymentVerified] = useState(skipPayment || false) // If skipping payment, assume verified
  const [bookingComplete, setBookingComplete] = useState(
    !requiresBooking && skipPayment && !!initialOrderId,
  ) // Only complete if orderId also exists
  const [customerEmail, setCustomerEmail] = useState(prefill?.email || '')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmittingConfirmedInfo, setIsSubmittingConfirmedInfo] = useState(false) // New state for submission after preview

  useEffect(() => {
    const createProvisionalOrderIfNeeded = async () => {
      if (skipPayment && !initialOrderId && !orderId && serviceId && locale) {
        // Only proceed if we don't have an orderId and it's a new, payment-skipped flow
        setIsCreatingProvisionalOrder(true)
        setError(null)
        try {
          // Log the authentication state and user info for debugging
          console.log('Authentication state:', { isAuthenticated, userId: user?.id, email: user?.email || customerEmail || prefill?.email })

          const response = await fetch('/api/v1/orders/initiate-service-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId,
              locale,
              customerEmail: isAuthenticated && user?.email
                ? user.email
                : (customerEmail || prefill?.email), // Use authenticated user email if available
              customerId: isAuthenticated && user?.id ? user.id : undefined, // Include user ID if authenticated
            }),
          })
          const result = await response.json()
          if (!response.ok || !result.success || !result.orderId) {
            throw new Error(result.error || 'Failed to initiate service order')
          }
          setOrderId(result.orderId)
          // Store the formatted order number if available
          if (result.orderNumber) {
            setOrderNumber(result.orderNumber)
          }
          setPaymentVerified(true) // Payment is skipped, so it's "verified" in this context

          // Re-evaluate initial step after getting orderId
          if (
            bookingSettings?.enableAdditionalInfo &&
            bookingSettings.additionalInfoFields?.length
          ) {
            setStep('additionalInfo')
          } else if (requiresBooking) {
            setStep('booking')
          } else {
            setStep('complete')
            setBookingComplete(true)
          }
        } catch (err) {
          console.error('Error creating provisional order:', err)
          setError(
            err instanceof Error
              ? err.message
              : t('errorInitiatingOrder', {
                  defaultValue: 'Failed to start your service request.',
                }),
          )
        } finally {
          setIsCreatingProvisionalOrder(false)
        }
      }
    }

    createProvisionalOrderIfNeeded()
  }, [
    skipPayment,
    initialOrderId,
    orderId,
    serviceId,
    locale,
    customerEmail,
    prefill?.email,
    bookingSettings,
    requiresBooking,
    t,
    user, // Now properly defined from useAuth hook
    isAuthenticated, // Now properly defined from useAuth hook
  ])

  // This useEffect might still be relevant if the flow can be re-entered after payment
  // For now, its direct payment verification logic is superseded by the main checkout page.
  useEffect(() => {
    if (orderId && !paymentVerified && !skipPayment && initialOrderId) {
      // Added initialOrderId check to ensure this is for resumed paid orders
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
  }, [orderId, paymentVerified, skipPayment, initialOrderId])

  // We'll define a function to check for service project
  // This will be used in the useEffect below

  const handleInitiateCheckout = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault()
    setEmailError(null)

    // Use authenticated user email if available, otherwise use form email
    const emailToUse = isAuthenticated && user?.email
      ? user.email
      : (prefill?.email || customerEmail)

    // Only validate email if user is not authenticated
    if (!isAuthenticated) {
      if (!emailToUse) {
        setEmailError(t('emailRequiredError'))
        return
      }
      if (!/\S+@\S+\.\S+/.test(emailToUse)) {
        setEmailError(t('emailInvalidError'))
        return
      }
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
  const handleAdditionalInfoSubmit = async (data: Record<string, any>) => {
    // Store the additional info data and move to preview
    setAdditionalInfo(data)
    setStep('preview')
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

  // Обработчик подтверждения дополнительной информации после предварительного просмотра
  const handleConfirmAdditionalInfo = async () => {
    if (!additionalInfo) return // Should not happen if step is 'preview'

    setIsSubmittingConfirmedInfo(true)
    setError(null)

    // Separate file fields from other data
    const fileFields =
      bookingSettings?.additionalInfoFields?.filter((field) => field.fieldType === 'fileUpload') ||
      []
    const dataWithoutFiles: Record<string, any> = {}
    const filesToUpload: { fieldName: string; files: File[] }[] = []

    for (const field of bookingSettings?.additionalInfoFields || []) {
      if (field.fieldType === 'fileUpload') {
        if (additionalInfo[field.fieldName] && Array.isArray(additionalInfo[field.fieldName])) {
          filesToUpload.push({
            fieldName: field.fieldName,
            files: additionalInfo[field.fieldName] as File[],
          })
        }
      } else {
        dataWithoutFiles[field.fieldName] = additionalInfo[field.fieldName]
      }
    }

    let uploadedFileUrls: Record<string, string[]> = {}

    // Upload files if any exist
    if (filesToUpload.length > 0 && orderId) {
      setIsSubmittingFiles(true)
      try {
        const formData = new FormData()
        formData.append('orderId', orderId)
        formData.append('locale', locale)

        filesToUpload.forEach(({ fieldName, files }) => {
          files.forEach((file) => {
            formData.append(fieldName, file)
          })
        })

        const uploadResponse = await fetch('/api/v1/orders/upload-additional-files', {
          method: 'POST',
          body: formData,
        })

        const uploadResult = await uploadResponse.json()

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload files')
        }
        uploadedFileUrls = uploadResult.uploadedFiles // Assuming API returns URLs like { fieldName: [url1, url2] }
      } catch (err) {
        console.error('Error uploading files:', err)
        setError(
          err instanceof Error
            ? err.message
            : t('errorUploadingFiles', { defaultValue: 'Failed to upload files.' }),
        )
        setIsSubmittingConfirmedInfo(false)
        setIsSubmittingFiles(false)
        return // Stop the process if file upload fails
      } finally {
        setIsSubmittingFiles(false)
      }
    }

    // Combine data without files and uploaded file URLs
    const finalAdditionalInfo = { ...dataWithoutFiles, ...uploadedFileUrls }

    // Now submit the combined additional info to the backend
    if (orderId) {
      try {
        const response = await fetch('/api/v1/orders/update-additional-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, additionalInfo: finalAdditionalInfo, locale }),
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to update additional info')
        }

        // Proceed to the next step based on requirements
        if (requiresBooking) {
          setStep('booking')
        } else {
          setStep('complete')
          setBookingComplete(true)
        }
      } catch (err) {
        console.error('Error submitting confirmed info:', err)
        setError(
          err instanceof Error
            ? err.message
            : t('errorSubmittingInfo', {
                defaultValue: 'Failed to submit additional information.',
              }),
        )
      } finally {
        setIsSubmittingConfirmedInfo(false)
      }
    } else {
      // This case should ideally not happen if we reached the preview step with data
      setError(t('errorNoOrderId', { defaultValue: 'Order ID is missing.' }))
      setIsSubmittingConfirmedInfo(false)
    }
  }

  // Обработчик редактирования дополнительной информации
  const handleEditAdditionalInfo = () => {
    setStep('additionalInfo')
  }

  // Define all functions without dependencies first

  // Функция для создания проекта по заказу
  const createServiceProject = async (orderIdToCreate: string) => {
    if (!orderIdToCreate) return false

    try {
      const response = await fetch('/api/v1/service-projects/create-from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderIdToCreate }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.projectId) {
        setProjectId(data.projectId)
        return true
      }
      return false
    } catch (err) {
      console.error('Error creating service project:', err)
      return false
    }
  }

  // Функция для проверки наличия проекта по заказу
  const checkServiceProject = async (orderIdToCheck: string) => {
    if (!orderIdToCheck || isCheckingProject) return

    setIsCheckingProject(true)
    try {
      const response = await fetch(`/api/v1/service-projects/check-exists?orderId=${orderIdToCheck}`)
      const data = await response.json()

      if (response.ok && data.exists && data.projectId) {
        setProjectId(data.projectId)
        return true
      } else if (response.ok && !data.exists) {
        // If project doesn't exist, try to create one
        return await createServiceProject(orderIdToCheck)
      }
      return false
    } catch (err) {
      console.error('Error checking for service project:', err)
      return false
    } finally {
      setIsCheckingProject(false)
    }
  }

  // Обработчик завершения бронирования
  const handleBookingComplete = () => {
    setBookingComplete(true)
    setStep('complete')

    // Check for project when booking is complete
    if (orderId) {
      checkServiceProject(orderId)
    }
  }

  // Add useEffect to check for project when order ID is set and booking is complete
  useEffect(() => {
    if (orderId && (step === 'complete' || bookingComplete)) {
      checkServiceProject(orderId)
    }
  }, [orderId, step, bookingComplete])

  // Определяем, должна ли кнопка отправки быть отключена на любом шаге
  const isSubmitDisabled =
    isLoading ||
    isCreatingProvisionalOrder ||
    isSubmittingAdditionalInfo ||
    isSubmittingConfirmedInfo ||
    isSubmittingFiles

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
            isSubmittingFiles={isSubmittingFiles} // Pass the loading state
          />
        )}
      </div>
    )
  }

  // Если нужно показать предварительный просмотр дополнительной информации
  if (step === 'preview' && additionalInfo && bookingSettings?.additionalInfoFields?.length) {
    return (
      <div className={className}>
        <Alert className="mb-4">
          <AlertDescription>{t('paymentComplete')}</AlertDescription>
        </Alert>

        <div className="p-6 border rounded-lg shadow-sm mt-4">
          <h3 className="text-xl font-medium mb-4">{t('previewAdditionalInfoTitle')}</h3>
          <p className="text-gray-600 mb-6">{t('previewAdditionalInfoDescription')}</p>

          <div className="space-y-4 mb-6">
            {bookingSettings.additionalInfoFields.map((field) => {
              const value = additionalInfo[field.fieldName]
              // Skip file upload fields in preview, they are handled separately
              if (field.fieldType === 'fileUpload') return null

              let displayValue = String(value)

              if (field.fieldType === 'date' && value instanceof Date) {
                displayValue = format(value, 'PPP')
              } else if (field.fieldType === 'checkbox') {
                displayValue = value ? t('yes') : t('no')
              } else if (field.fieldType === 'select' && field.options) {
                const selectedOption = field.options.find((opt) => opt.value === value)
                displayValue = selectedOption ? selectedOption.label : String(value)
              }

              return (
                <div key={field.fieldName} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-700">{field.fieldLabel}</p>
                  <p className="text-base text-gray-900 break-words">{displayValue || '-'}</p>
                </div>
              )
            })}
          </div>

          {/* Display uploaded files if any */}
          {bookingSettings.additionalInfoFields.some((field) => field.fieldType === 'fileUpload') &&
            additionalInfo &&
            Object.keys(additionalInfo).some(
              (key) =>
                Array.isArray(additionalInfo[key]) && (additionalInfo[key] as File[]).length > 0,
            ) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-lg font-medium mb-3">{t('uploadedFiles')}</h4>
                <ul className="list-disc list-inside space-y-2">
                  {bookingSettings.additionalInfoFields
                    .map((field) => {
                      if (
                        field.fieldType === 'fileUpload' &&
                        additionalInfo &&
                        Array.isArray(additionalInfo[field.fieldName])
                      ) {
                        const files = additionalInfo[field.fieldName] as File[]
                        return files.map((file, index) => (
                          <li
                            key={`${field.fieldName}-${index}`}
                            className="text-sm text-gray-700 break-words"
                          >
                            {field.fieldLabel}: {file.name} ({Math.round(file.size / 1024)} KB)
                          </li>
                        ))
                      }
                      return null
                    })
                    .filter(Boolean)}
                </ul>
              </div>
            )}

          {error && (
            <Alert variant="destructive" className="mb-4 mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSubmittingFiles && (
            <Alert className="mb-4 mt-6">
              <AlertDescription>{t('uploadingFiles')}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleEditAdditionalInfo}
              disabled={isSubmitDisabled}
            >
              {t('editAdditionalInfo')}
            </Button>
            <Button type="button" onClick={handleConfirmAdditionalInfo} disabled={isSubmitDisabled}>
              {isSubmittingConfirmedInfo ? t('processing') : t('confirmAndContinue')}
            </Button>
          </div>
        </div>
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
          <h3 className="text-lg font-medium mb-2 text-green-700">{t('projectInitiatedTitle')}</h3>
          <p className="mb-4 text-green-600">{t('projectInitiatedDescription')}</p>

          {(orderNumber || orderId) && (
            <p className="text-sm text-green-600 mb-4">
              {t('orderNumber')}: <span className="font-medium">{orderNumber || orderId}</span>
            </p>
          )}

          {/* Show project button if project exists */}
          {projectId && (
            <Button
              onClick={() => (window.location.href = `/${locale}/dashboard/projects/${projectId}`)}
              variant="default"
              className="w-full mb-3"
            >
              {t('goToProject')}
            </Button>
          )}

          {/* Show loading state while checking for project */}
          {isCheckingProject && !projectId && (
            <div className="w-full mb-3 flex justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Add button to view all projects */}
          <div className="flex flex-col space-y-3">
            {projectId && (
              <Button
                onClick={() => (window.location.href = `/${locale}/dashboard/projects`)}
                variant="outline"
                className="w-full"
              >
                {t('viewProjects')}
              </Button>
            )}

            <Button
              onClick={() => (window.location.href = `/${locale}/account/orders`)}
              variant={projectId ? "outline" : "default"}
              className="w-full"
            >
              {t('viewOrders')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state for provisional order creation
  if (isCreatingProvisionalOrder) {
    return (
      <div className={`${className} flex justify-center items-center p-8`}>
        <div className="text-center">
          <p>
            {t('initiatingServiceRequest', { defaultValue: 'Initiating your service request...' })}
          </p>
          {/* Add a spinner or loading animation here if desired */}
        </div>
      </div>
    )
  }

  // В противном случае показываем шаг оплаты (if step is 'payment')
  return (
    <div className={className}>
      <form onSubmit={handleInitiateCheckout} className="p-6 border rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-2">{t('paymentTitle')}</h3>
        <p className="mb-4">{t('paymentDescription')}</p>

        {!prefill?.email && !isAuthenticated && (
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
        {isAuthenticated && user?.email && (
          <div className="mb-4">
            <Label className="mb-1 block">
              {t('emailLabel')}
            </Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
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
