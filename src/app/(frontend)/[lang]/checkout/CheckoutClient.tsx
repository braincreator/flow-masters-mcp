'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
// import { useTranslations } from '@/hooks/useTranslations' // Temporarily remove to isolate issues
import { formatPrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'
import { Button } from '@/components/ui/button'
import {
  X,
  CreditCard,
  Wallet,
  ArrowRight,
  ShoppingBag,
  Loader2,
  Bitcoin,
  Check,
  ChevronRight,
  Trash2,
  BadgePercent,
  ShoppingBasket,
  CreditCardIcon,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'
import React from 'react'
import CryptoCurrencySelector from '@/components/CryptoCurrencySelector'
import { Product, Service, CartSession, Media } from '@/payload-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { DetailedCartItemsList, CartItemType } from '@/components/Cart/DetailedCartItemsList'

// Добавляем интерфейс для метаданных платежа
interface PaymentMetadata {
  customerEmail: string
  locale: 'ru' | 'en'
  discount?: {
    code: string
    amount: number
    percentage?: number
  }
  originalAmount?: number
  originalCurrency?: string
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface CheckoutClientProps {
  locale: Locale
}

interface PaymentProviderOption {
  id: string
  name: string
  enabled?: boolean
  credentials?: {
    supported_currencies?: string
  }
}

// Улучшаем дизайн прогресс-бара - выравниваем по центру иконок
const CheckoutProgress = ({
  activeStep,
  goToStep,
  locale,
  isEmailValid,
  hasItems,
}: {
  activeStep: 'cart' | 'contact' | 'payment'
  goToStep: (step: 'cart' | 'contact' | 'payment') => void
  locale: Locale
  isEmailValid: boolean
  hasItems: boolean
}) => {
  // Используем хук для определения размера экрана
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  return (
    <div>
      <div className={cn('flex justify-between items-center', isMobile && 'flex-col gap-6')}>
        <button
          onClick={() => goToStep('cart')}
          className={cn(
            'flex items-center relative group transition-all',
            isMobile
              ? 'flex-row w-full justify-start gap-3 p-2 rounded-lg hover:bg-primary/5'
              : 'flex-col',
            activeStep === 'cart' ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <div
            className={cn(
              'relative h-12 w-12 flex items-center justify-center transition-colors',
              activeStep === 'cart'
                ? 'text-primary-foreground'
                : 'text-muted-foreground group-hover:text-foreground',
            )}
          >
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all',
                activeStep === 'cart'
                  ? 'bg-primary shadow-md shadow-primary/30 scale-110'
                  : 'bg-muted/80 group-hover:bg-muted/90',
              )}
            />
            <ShoppingBag className="h-5 w-5 relative z-10" />
            <div className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium rounded-full border-2 border-background animate-pulse">
              1
            </div>
          </div>
          <span className={cn('font-medium', isMobile ? 'text-base' : 'text-sm mt-3')}>
            {locale === 'ru' ? 'Корзина' : 'Cart'}
          </span>

          {isMobile && activeStep === 'cart' && (
            <div className="ml-auto rounded-full bg-primary/20 px-2 py-1">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
        </button>

        {!isMobile && (
          <div className="relative flex-1 mx-4 flex items-center">
            <div className="h-3 w-full rounded-full bg-muted/50" />
            <div
              className={cn(
                'absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-700 ease-out',
                activeStep === 'cart' ? 'w-0' : activeStep === 'contact' ? 'w-full' : 'w-full',
              )}
            />
          </div>
        )}

        <button
          onClick={() => hasItems && goToStep('contact')}
          className={cn(
            'flex items-center relative group transition-all',
            isMobile
              ? 'flex-row w-full justify-start gap-3 p-2 rounded-lg hover:bg-primary/5'
              : 'flex-col',
            activeStep === 'contact'
              ? 'text-primary'
              : !hasItems
                ? 'opacity-60 text-muted-foreground cursor-not-allowed'
                : 'text-muted-foreground',
          )}
          disabled={!hasItems}
        >
          <div
            className={cn(
              'relative h-12 w-12 flex items-center justify-center transition-colors',
              activeStep === 'contact'
                ? 'text-primary-foreground'
                : activeStep === 'payment' && isEmailValid
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground group-hover:text-foreground',
            )}
          >
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all',
                activeStep === 'contact'
                  ? 'bg-primary shadow-md shadow-primary/30 scale-110'
                  : activeStep === 'payment' && isEmailValid
                    ? 'bg-primary/80'
                    : 'bg-muted/80 group-hover:bg-muted/90',
              )}
            />
            {activeStep === 'payment' && isEmailValid ? (
              <Check className="h-5 w-5 relative z-10" />
            ) : (
              <CreditCardIcon className="h-5 w-5 relative z-10" />
            )}
            <div className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium rounded-full border-2 border-background animate-pulse">
              2
            </div>
          </div>
          <span className={cn('font-medium', isMobile ? 'text-base' : 'text-sm mt-3')}>
            {locale === 'ru' ? 'Контакты' : 'Contact'}
          </span>

          {isMobile && activeStep === 'contact' && (
            <div className="ml-auto rounded-full bg-primary/20 px-2 py-1">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
        </button>

        {!isMobile && (
          <div className="relative flex-1 mx-4 flex items-center">
            <div className="h-3 w-full rounded-full bg-muted/50" />
            <div
              className={cn(
                'absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-700 ease-out',
                activeStep === 'payment' ? 'w-full' : 'w-0',
              )}
            />
          </div>
        )}

        <button
          onClick={() => isEmailValid && goToStep('payment')}
          className={cn(
            'flex items-center relative group transition-all',
            isMobile
              ? 'flex-row w-full justify-start gap-3 p-2 rounded-lg hover:bg-primary/5'
              : 'flex-col',
            activeStep === 'payment'
              ? 'text-primary'
              : !isEmailValid
                ? 'opacity-60 text-muted-foreground cursor-not-allowed'
                : 'text-muted-foreground',
          )}
          disabled={!isEmailValid}
        >
          <div
            className={cn(
              'relative h-12 w-12 flex items-center justify-center transition-colors',
              activeStep === 'payment'
                ? 'text-primary-foreground'
                : 'text-muted-foreground group-hover:text-foreground',
            )}
          >
            <div
              className={cn(
                'absolute inset-0 rounded-full transition-all',
                activeStep === 'payment'
                  ? 'bg-primary shadow-md shadow-primary/30 scale-110'
                  : 'bg-muted/80 group-hover:bg-muted/90',
              )}
            />
            <Wallet className="h-5 w-5 relative z-10" />
            <div className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium rounded-full border-2 border-background animate-pulse">
              3
            </div>
          </div>
          <span className={cn('font-medium', isMobile ? 'text-base' : 'text-sm mt-3')}>
            {locale === 'ru' ? 'Оплата' : 'Payment'}
          </span>

          {isMobile && activeStep === 'payment' && (
            <div className="ml-auto rounded-full bg-primary/20 px-2 py-1">
              <Check className="h-4 w-4 text-primary" />
            </div>
          )}
        </button>
      </div>

      {/* Только для мобильной версии - прогресс индикатор */}
      {isMobile && (
        <div className="relative w-full mt-4 h-3">
          <div className="h-3 w-full rounded-full bg-muted/50" />
          <div
            className={cn(
              'absolute left-0 top-0 h-3 rounded-full bg-primary transition-[width] duration-700 ease-out',
              activeStep === 'cart' ? 'w-[5%]' : activeStep === 'contact' ? 'w-[50%]' : 'w-full',
            )}
          />
          <div className="absolute top-0 left-[16.66%] w-4 h-3 flex justify-center items-center">
            <div
              className={cn(
                'w-3 h-3 rounded-full transform transition-colors duration-300',
                activeStep === 'cart'
                  ? 'bg-primary scale-125'
                  : activeStep === 'contact' || activeStep === 'payment'
                    ? 'bg-primary'
                    : 'bg-muted',
              )}
            />
          </div>
          <div className="absolute top-0 left-[50%] w-4 h-3 flex justify-center items-center">
            <div
              className={cn(
                'w-3 h-3 rounded-full transform transition-colors duration-300',
                activeStep === 'contact'
                  ? 'bg-primary scale-125'
                  : activeStep === 'payment'
                    ? 'bg-primary'
                    : 'bg-muted',
              )}
            />
          </div>
          <div className="absolute top-0 left-[83.33%] w-4 h-3 flex justify-center items-center">
            <div
              className={cn(
                'w-3 h-3 rounded-full transform transition-colors duration-300',
                activeStep === 'payment' ? 'bg-primary scale-125' : 'bg-muted',
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function CheckoutClient({ locale }: CheckoutClientProps) {
  const {
    cart,
    total = 0,
    clear: clearCart = () => {},
    remove: removeFromCart = () => {},
    refreshCart,
    updateItem,
    itemsLoading,
  } = useCart()
  // const t = useTranslations(locale); // Temporarily using hardcoded strings

  const [isCheckingCart, setIsCheckingCart] = useState(true)
  const [activeStep, setActiveStep] = useState<'cart' | 'contact' | 'payment'>('cart')
  const [checkoutComplete, setCheckoutComplete] = useState(false)

  // Ref для прокрутки к верху при смене шага
  const checkoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkCart = async () => {
      setIsCheckingCart(true)
      console.log('CheckoutClient: Checking cart state on page load')

      const lastAddedService = sessionStorage.getItem('last_added_service')

      try {
        await refreshCart()

        if (cart && cart.items && cart.items.length > 0) {
          console.log('CheckoutClient: Cart has items:', cart.items)

          if (lastAddedService) {
            const serviceFound = cart.items.some((item) => {
              if (item.itemType === 'service') {
                const serviceId = typeof item.service === 'string' ? item.service : item.service?.id
                return serviceId === lastAddedService
              }
              return false
            })

            console.log('CheckoutClient: Last added service found in cart:', serviceFound)

            if (!serviceFound) {
              console.log('CheckoutClient: Service not found, retrying fetch...')
              await new Promise((resolve) => setTimeout(resolve, 500))
              await refreshCart()
            }
          }
        } else {
          console.log('CheckoutClient: Cart is empty, retrying fetch...')
          await new Promise((resolve) => setTimeout(resolve, 500))
          await refreshCart()
        }
      } catch (err) {
        console.error('CheckoutClient: Error checking cart:', err)
      } finally {
        setIsCheckingCart(false)
        sessionStorage.removeItem('last_added_service')
      }
    }

    checkCart()

    // Подгружаем email из sessionStorage если он есть
    const savedEmail = sessionStorage.getItem('checkout_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setIsEmailValid(isValidEmail(savedEmail))
      console.log('CheckoutClient: Email loaded from session storage:', savedEmail)
    }
  }, [refreshCart])

  const [email, setEmail] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [paymentProviders, setPaymentProviders] = useState<Array<PaymentProviderOption>>([])
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [isLoadingProviders, setIsLoadingProviders] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    amount: number
    percentage?: number
  } | null>(null)
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState<string | null>(null)

  const [selectedCryptoCurrency, setSelectedCryptoCurrency] = useState('ETH')

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoadingProviders(true)
      try {
        const response = await fetch('/api/v1/payment/providers')
        if (!response.ok) throw new Error('Failed to fetch payment providers')
        const data = await response.json()
        let providersData: PaymentProviderOption[] = data.providers || []
        let defaultProviderId = data.defaultProvider

        providersData = providersData.filter(
          (provider: PaymentProviderOption) => provider && provider.enabled !== false,
        )

        if (!providersData || providersData.length === 0) {
          console.warn('No enabled payment providers found')
          providersData = []
          defaultProviderId = null
        }

        providersData = providersData.map((provider: any, index: number) => ({
          id: provider.id || `provider-${index}`,
          name: provider.name || `Provider ${index + 1}`,
          credentials: provider.credentials || {},
        }))

        setPaymentProviders(providersData)

        if (
          defaultProviderId &&
          providersData.some((p: PaymentProviderOption) => p.id === defaultProviderId)
        ) {
          setSelectedProvider(defaultProviderId)
        } else if (providersData.length > 0 && providersData[0]) {
          setSelectedProvider(providersData[0].id)
        } else {
          setSelectedProvider(null)
        }
      } catch (errCatch) {
        console.error('Error fetching payment providers:', errCatch)
        setPaymentProviders([])
        setSelectedProvider(null)
      } finally {
        setIsLoadingProviders(false)
      }
    }

    fetchProviders()
  }, [locale])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setIsEmailValid(isValidEmail(newEmail))

    // Сохраняем email в sessionStorage для повторного использования
    sessionStorage.setItem('checkout_email', newEmail)

    if (emailError && isValidEmail(newEmail)) {
      setEmailError(null)
    }
  }

  const handleDiscountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountCode(e.target.value)
    if (discountError) {
      setDiscountError(null)
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError(locale === 'ru' ? 'Введите промокод' : 'Enter a discount code')
      return
    }

    setIsApplyingDiscount(true)
    setDiscountError(null)

    try {
      const response = await fetch('/api/v1/discount/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: discountCode,
          cartTotal: total,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply discount')
      }

      if (!data.isValid) {
        setDiscountError(
          data.message || (locale === 'ru' ? 'Недействительный промокод' : 'Invalid discount code'),
        )
        return
      }

      console.log('Discount applied successfully:', data)

      // Применяем скидку
      setAppliedDiscount({
        code: discountCode,
        amount: data.discountAmount,
        percentage: data.discountPercentage,
      })

      // Очищаем поле ввода
      setDiscountCode('')

      // Показываем уведомление пользователю
      // Здесь можно добавить код для показа сообщения об успешном применении скидки
    } catch (errCatch) {
      console.error('Error applying discount:', errCatch)
      setDiscountError(
        errCatch instanceof Error
          ? errCatch.message
          : locale === 'ru'
            ? 'Ошибка применения скидки'
            : 'Error applying discount',
      )
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
  }

  const handleCheckout = async () => {
    setError(null)
    setEmailError(null)

    if (!email) {
      setEmailError('Please enter your email')
      return
    }
    if (!isEmailValid) {
      setEmailError('Please enter a valid email address (e.g., name@example.com)')
      return
    }
    if (!selectedProvider) {
      setError('Please select a payment method')
      return
    }

    try {
      setIsLoading(true)
      const provider = paymentProviders.find((p) => p.id === selectedProvider)
      if (!provider) {
        throw new Error('Selected payment method is unavailable')
      }

      // Дополнительное логирование для отладки
      console.log('Payment provider:', provider)
      console.log('Payment provider ID:', provider.id)
      console.log('Payment provider name:', provider.name)

      // Проверяем наличие минимальных обязательных полей для провайдера
      if (!provider.id) {
        throw new Error('Payment provider ID is missing')
      }

      // Проверка суммы заказа
      if (total <= 0) {
        throw new Error('Invalid order total: ' + total)
      }

      // Убедимся, что локаль указана корректно
      const validLocale = ['ru', 'en'].includes(locale) ? locale : 'ru'

      // Use the original total without currency conversion
      const displayTotal = total
      console.log('Total amount to charge:', displayTotal, locale === 'ru' ? 'RUB' : 'USD')

      const paymentDataItems = cart?.items
        ?.map((item) => {
          if (item.itemType === 'service' && item.service) {
            const serviceId = typeof item.service === 'string' ? item.service : item.service?.id
            if (!serviceId) return null
            return {
              serviceId,
              quantity: item.quantity,
            }
          }
          if (item.itemType === 'product' && item.product) {
            const productId = typeof item.product === 'string' ? item.product : item.product?.id
            if (!productId) return null
            return {
              productId,
              quantity: item.quantity,
            }
          }
          return null
        })
        .filter(Boolean)

      if (!paymentDataItems || paymentDataItems.length === 0) {
        throw new Error('Cart is empty')
      }

      const cryptoSpecificData: { selectedCurrency?: string } = {}
      if (provider.id === 'crypto') {
        cryptoSpecificData.selectedCurrency = selectedCryptoCurrency
      }

      // Формируем данные для платежа
      const paymentData = {
        items: paymentDataItems,
        customer: {
          email,
          locale: validLocale,
          name: email.split('@')[0],
        },
        // Передаем только ID провайдера, на сервере данные будут получены из CMS
        provider: typeof provider === 'string' ? provider : provider.id,
        currency: validLocale === 'ru' ? 'RUB' : 'USD',
        amount: displayTotal,
        description: `Заказ от ${new Date().toISOString().split('T')[0]}`,
        returnUrl: `${window.location.origin}/${validLocale}/payment/success`,
        failUrl: `${window.location.origin}/${validLocale}/payment/fail`,
        ...cryptoSpecificData,
        metadata: {
          customerEmail: email,
          locale: validLocale,
          // Добавляем исходные данные для аудита
          originalAmount: total,
          originalCurrency: 'RUB', // Базовая валюта системы
        } as PaymentMetadata,
      }

      // Добавляем данные скидки только если она применена
      if (appliedDiscount) {
        const updatedMetadata: PaymentMetadata = {
          ...(paymentData.metadata as PaymentMetadata),
          discount: {
            code: appliedDiscount.code,
            amount: appliedDiscount.amount,
          },
        }
        paymentData.metadata = updatedMetadata
      }

      // Дополнительное логирование данных запроса
      console.log('Payment data being sent:', JSON.stringify(paymentData, null, 2))

      // Временное решение для отладки - добавляем тестовый режим в URL
      const paymentEndpoint = '/api/v1/payment/create'

      const response = await fetch(paymentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      // Всегда пытаемся получить ответ в формате JSON для детальной информации об ошибке
      const responseData = await response.json().catch(() => null)
      console.log('Server response:', responseData)

      if (!response.ok) {
        // Извлекаем максимально подробную информацию об ошибке из ответа
        const errorMessage =
          responseData?.error ||
          (responseData?.message ? `Error: ${responseData.message}` : 'Checkout failed')

        // Логируем полный ответ сервера для отладки
        console.error('Server error details:', responseData)

        // Формируем детальное сообщение об ошибке
        let detailedError =
          locale === 'ru'
            ? `Ошибка платежной системы: ${errorMessage}`
            : `Payment system error: ${errorMessage}`

        // Если есть подробные детали ошибки от платежного провайдера, добавляем их
        if (responseData?.errorDetails) {
          detailedError +=
            locale === 'ru'
              ? `\nДополнительная информация: ${responseData.errorDetails}`
              : `\nAdditional information: ${responseData.errorDetails}`
        }

        // Добавляем код HTTP статуса для технической информации
        detailedError += ` (${response.status})`

        // Если это ошибка Robokassa и мы это знаем, указываем это явно
        if (responseData?.providerError && selectedProvider === 'robokassa') {
          detailedError =
            locale === 'ru'
              ? `Ошибка Robokassa: ${errorMessage}`
              : `Robokassa error: ${errorMessage}`
        }

        throw new Error(detailedError)
      }

      const paymentUrl = responseData.paymentUrl
      if (!paymentUrl) {
        throw new Error('Payment URL is missing in response')
      }

      if (clearCart) {
        await clearCart()
      }
      window.location.href = paymentUrl
    } catch (errCatch) {
      console.error('Checkout error:', errCatch)
      setError(errCatch instanceof Error ? errCatch.message : 'Checkout error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const currentCartItems: CartItemType[] = cart?.items || []

  // getItemTitle and getItemImageUrl are now part of DetailedCartItemsList or its props
  // We will rely on the props passed to DetailedCartItemsList for rendering.

  // Новые функции для управления пошаговым интерфейсом
  const goToNextStep = () => {
    if (activeStep === 'cart') {
      if (currentCartItems.length > 0) {
        setActiveStep('contact')
        checkoutRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (activeStep === 'contact') {
      // Требуем валидный email перед переходом к оплате
      if (isEmailValid) {
        setActiveStep('payment')
        checkoutRef.current?.scrollIntoView({ behavior: 'smooth' })
      } else {
        setEmailError('Необходимо ввести корректный email для получения информации о заказе')
      }
    }
  }

  const goToStep = (step: 'cart' | 'contact' | 'payment') => {
    setActiveStep(step)
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!isCheckingCart) {
      // Добавляем плавную анимацию появления контента после загрузки
      const timeout = setTimeout(() => {
        const content = document.getElementById('checkout-content')
        if (content) {
          content.style.opacity = '1'
          content.style.transform = 'translateY(0)'
        }
      }, 100)

      return () => clearTimeout(timeout)
    }
  }, [isCheckingCart])

  if (isCheckingCart) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-background rounded-xl shadow-sm border"
        >
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <ShoppingBasket className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <h2 className="text-2xl font-medium mb-3">
            {locale === 'ru' ? 'Загрузка корзины...' : 'Loading your cart...'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {locale === 'ru'
              ? 'Пожалуйста, подождите, мы проверяем ваши товары и актуализируем цены'
              : 'Please wait while we check your items and update prices'}
          </p>
          <div className="w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  if (currentCartItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 bg-background rounded-xl shadow-sm border"
        >
          <div className="mb-6 flex justify-center">
            <div className="relative h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-medium mb-3">
            {locale === 'ru' ? 'Ваша корзина пуста' : 'Your cart is empty'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {locale === 'ru'
              ? 'Добавьте товары или услуги в корзину, чтобы продолжить оформление заказа'
              : 'Add some products or services to your cart to continue with checkout'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <a href={`/${locale}/products`}>
                <ShoppingBag className="h-4 w-4" />
                {locale === 'ru' ? 'Перейти к товарам' : 'Browse products'}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href={`/${locale}/services`}>
                <CreditCardIcon className="h-4 w-4" />
                {locale === 'ru' ? 'Перейти к услугам' : 'Browse services'}
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="max-w-5xl mx-auto py-8 px-4 sm:px-6"
      ref={checkoutRef}
      id="checkout-content"
      style={{
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Индикатор прогресса оформления */}
      <div className="mb-10 bg-card/40 rounded-xl backdrop-blur-sm p-4 sm:p-6 border shadow-sm">
        <h1 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 inline-block">
          {locale === 'ru' ? 'Оформление заказа' : 'Checkout'}
        </h1>
        <CheckoutProgress
          activeStep={activeStep}
          goToStep={goToStep}
          locale={locale}
          isEmailValid={isEmailValid}
          hasItems={currentCartItems.length > 0}
        />
      </div>

      {/* Основное содержимое страницы */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeStep === 'cart' && (
              <motion.div
                key="cart-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-6 overflow-hidden border-muted/60 dark:border-muted/30 shadow-md dark:shadow-sm dark:shadow-primary/5">
                  <CardHeader className="border-b bg-card/60 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-xl">
                          <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
                          {locale === 'ru' ? 'Корзина товаров' : 'Shopping Cart'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {currentCartItems.length === 0
                            ? locale === 'ru'
                              ? 'Ваша корзина пуста'
                              : 'Your cart is empty'
                            : `${currentCartItems.length} ${
                                currentCartItems.length === 1
                                  ? locale === 'ru'
                                    ? 'товар'
                                    : 'item'
                                  : locale === 'ru'
                                    ? currentCartItems.length < 5
                                      ? 'товара'
                                      : 'товаров'
                                    : 'items'
                              } ${locale === 'ru' ? 'в корзине' : 'in your cart'}`}
                        </CardDescription>
                      </div>
                      {currentCartItems.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearCart()}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          {locale === 'ru' ? 'Очистить' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="py-4">
                    <DetailedCartItemsList
                      items={currentCartItems}
                      locale={locale}
                      removeFromCart={removeFromCart}
                      updateItem={updateItem}
                      itemsLoading={itemsLoading || {}} // Ensure itemsLoading is always an object
                      isCheckout={true}
                    />
                  </CardContent>

                  {currentCartItems.length > 0 && (
                    <CardFooter className="flex flex-col pt-0 px-6 pb-6">
                      <Button
                        className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={goToNextStep}
                        disabled={currentCartItems.length === 0}
                      >
                        {locale === 'ru' ? 'Продолжить' : 'Continue'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Контактная информация - будет добавлена в следующих шагах */}
            {activeStep === 'contact' && (
              <motion.div
                key="contact-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
              >
                <Card className="mb-6 overflow-hidden border-muted/60 dark:border-muted/30 shadow-md dark:shadow-sm dark:shadow-primary/5">
                  <CardHeader className="border-b bg-card/60 backdrop-blur-sm">
                    <CardTitle className="flex items-center text-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 text-primary"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      {locale === 'ru' ? 'Контактная информация' : 'Contact information'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {locale === 'ru'
                        ? 'Укажите email для получения товара и чека'
                        : 'Enter your email to receive the product and receipt'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base flex items-center">
                          Email
                          <span className="text-xs ml-2 px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary font-medium">
                            {locale === 'ru' ? 'Обязательно' : 'Required'}
                          </span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={handleEmailChange}
                            className={cn(
                              'transition-all duration-300 pl-10 h-12 text-base',
                              email.length > 0 && !isEmailValid
                                ? 'border-2 border-destructive focus:border-destructive focus:ring-destructive/40 focus-visible:outline-none'
                                : email.length > 0 && isEmailValid
                                  ? 'border-2 border-green-500 focus:border-green-500 focus:ring-accent/40 focus-visible:outline-none shadow-sm shadow-green-500/10'
                                  : 'hover:border-accent/50 focus:border-2 focus:border-primary/50 focus:ring-primary/30 focus-visible:outline-none',
                            )}
                            required
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                          </div>
                        </div>
                        {emailError && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-destructive mt-2 flex items-center bg-destructive/10 p-2 rounded"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-1"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" x2="12" y1="8" y2="12" />
                              <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                            {emailError}
                          </motion.p>
                        )}
                        {email.length > 0 && isEmailValid && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-green-500 mt-2 flex items-center bg-green-500/10 p-2 rounded"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {locale === 'ru' ? 'Email валиден' : 'Email is valid'}
                          </motion.p>
                        )}
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 my-4"
                      >
                        <div className="flex gap-3">
                          <div className="text-blue-500 dark:text-blue-400 mt-0.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z" />
                              <path d="M12 13v8" />
                              <path d="M5 13v6a2 2 0 0 0 2 2h8" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                              {locale === 'ru'
                                ? 'Автоматическая регистрация'
                                : 'Automatic Registration'}
                            </h4>
                            <p className="text-xs text-blue-600/90 dark:text-blue-400/90">
                              {locale === 'ru'
                                ? 'Если в системе нет пользователя с указанным email, аккаунт будет создан автоматически для вашего удобства.'
                                : 'If there is no user with the specified email, an account will be automatically created for your convenience.'}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <Alert className="bg-muted/50 border-muted/70">
                        <div className="flex items-start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-info mr-2 mt-0.5 text-primary"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                          <AlertDescription className="text-sm text-muted-foreground">
                            {locale === 'ru'
                              ? 'Для цифровых продуктов и услуг адрес доставки не требуется. Все материалы будут отправлены на указанный email.'
                              : 'No shipping address required for digital products and services. All materials will be sent to the provided email.'}
                          </AlertDescription>
                        </div>
                      </Alert>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-4 px-6 pb-6 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => goToStep('cart')}
                      className="flex items-center gap-2 hover:bg-muted/50 hover:text-foreground transition-colors border-primary/20 hover:border-primary order-2 sm:order-1 sm:w-auto w-full"
                    >
                      <motion.div
                        animate={{ x: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </motion.div>
                      {locale === 'ru' ? 'Назад' : 'Back'}
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group order-1 sm:order-2 sm:max-w-[250px] w-full"
                      onClick={goToNextStep}
                      disabled={!isEmailValid}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {locale === 'ru' ? 'Продолжить к оплате' : 'Continue to payment'}
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </motion.div>
                      </span>
                      <span className="absolute inset-0 bg-primary/10 w-16 h-full transform -skew-x-12 -translate-x-40 transition-transform ease-in-out duration-700 group-hover:translate-x-64"></span>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Оплата - будет добавлена в следующих шагах */}
            {activeStep === 'payment' && (
              <motion.div
                key="payment-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
              >
                <Card className="mb-6 overflow-hidden border-muted/60 dark:border-muted/30 shadow-md dark:shadow-sm dark:shadow-primary/5">
                  <CardHeader className="border-b bg-card/60 backdrop-blur-sm">
                    <CardTitle className="flex items-center text-xl">
                      <Wallet className="h-5 w-5 mr-2 text-primary" />
                      {locale === 'ru' ? 'Способ оплаты' : 'Payment Method'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {locale === 'ru'
                        ? 'Выберите удобный способ оплаты'
                        : 'Select your preferred payment method'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="py-8">
                    {isLoadingProviders ? (
                      <div className="w-full flex justify-center items-center py-12">
                        <div className="text-center">
                          <div className="relative mb-4">
                            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30" />
                            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                          </div>
                          <p className="text-muted-foreground">
                            {locale === 'ru'
                              ? 'Загрузка способов оплаты...'
                              : 'Loading payment methods...'}
                          </p>
                        </div>
                      </div>
                    ) : paymentProviders.length === 0 ? (
                      <Alert className="border-destructive bg-destructive/10">
                        <div className="flex items-start space-x-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-destructive mt-0.5"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                          </svg>
                          <div>
                            <h4 className="font-medium text-destructive mb-1">
                              {locale === 'ru'
                                ? 'Способы оплаты недоступны'
                                : 'Payment Methods Unavailable'}
                            </h4>
                            <AlertDescription className="text-sm text-muted-foreground">
                              {locale === 'ru'
                                ? 'В настоящее время способы оплаты недоступны. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.'
                                : 'Payment methods are currently unavailable. Please try again later or contact support.'}
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 border-l-4 border-primary/70 bg-primary/5 rounded-md mb-4">
                          <p className="text-sm">
                            {locale === 'ru'
                              ? 'Выберите предпочтительный способ оплаты ниже. Все платежи защищены и обрабатываются безопасно.'
                              : 'Choose your preferred payment method below. All payments are secured and processed safely.'}
                          </p>
                        </div>

                        {paymentProviders.map((provider: PaymentProviderOption, index: number) => {
                          const providerId = provider.id || `provider-${index}`

                          let providerIcon
                          let providerColor
                          let providerDescription

                          if (providerId === 'yoomoney') {
                            providerIcon = <CreditCard className="h-5 w-5" />
                            providerColor =
                              'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                            providerDescription =
                              locale === 'ru'
                                ? 'Банковские карты, Сбербанк Онлайн и др.'
                                : 'Bank cards, Sberbank Online, etc.'
                          } else if (providerId === 'robokassa') {
                            providerIcon = <Wallet className="h-5 w-5" />
                            providerColor =
                              'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            providerDescription =
                              locale === 'ru'
                                ? 'Множество способов оплаты'
                                : 'Multiple payment methods'
                          } else if (providerId === 'stripe') {
                            providerIcon = <CreditCard className="h-5 w-5" />
                            providerColor =
                              'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                            providerDescription =
                              locale === 'ru'
                                ? 'Visa, Mastercard и другие карты'
                                : 'Visa, Mastercard and other cards'
                          } else if (providerId === 'paypal') {
                            providerIcon = <Wallet className="h-5 w-5" />
                            providerColor =
                              'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            providerDescription = 'PayPal'
                          } else if (providerId === 'crypto') {
                            providerIcon = <Bitcoin className="h-5 w-5" />
                            providerColor =
                              'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            providerDescription =
                              locale === 'ru' ? 'Криптовалюты' : 'Cryptocurrencies'
                          } else {
                            providerIcon = <CreditCard className="h-5 w-5" />
                            providerColor =
                              'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            providerDescription =
                              locale === 'ru' ? 'Электронный платеж' : 'Electronic payment'
                          }

                          return (
                            <motion.div
                              key={`payment-provider-${providerId}-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                              className={cn(
                                'flex items-center space-x-4 border-2 rounded-lg p-4 cursor-pointer transition-all',
                                selectedProvider === providerId
                                  ? 'border-primary bg-primary/5 shadow-md dark:bg-primary/10'
                                  : 'border-muted/60 hover:border-primary/50 dark:border-muted/30 dark:hover:border-primary/30',
                              )}
                              onClick={() => setSelectedProvider(providerId)}
                            >
                              <div
                                className={cn(
                                  'h-10 w-10 rounded-full flex items-center justify-center',
                                  providerColor,
                                )}
                              >
                                {providerIcon}
                              </div>

                              <div className="flex-1">
                                <label
                                  htmlFor={`payment-method-${providerId}-${index}`}
                                  className="flex flex-col cursor-pointer"
                                >
                                  <span className="font-medium">
                                    {provider.name || 'Unknown Provider'}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    {providerDescription}
                                  </span>
                                </label>
                              </div>

                              <div className="flex items-center justify-center h-5 w-5 rounded-full border-2 transition-colors relative">
                                {selectedProvider === providerId && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-2.5 w-2.5 rounded-full bg-primary"
                                  />
                                )}
                                <input
                                  type="radio"
                                  id={`payment-method-${providerId}-${index}`}
                                  name="payment-provider"
                                  value={providerId}
                                  checked={selectedProvider === providerId}
                                  onChange={() => setSelectedProvider(providerId)}
                                  className="sr-only"
                                />
                              </div>
                            </motion.div>
                          )
                        })}

                        {selectedProvider === 'crypto' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="ml-6 mt-2 p-4 border rounded-lg bg-muted/30 dark:bg-muted/10"
                          >
                            <h4 className="text-sm font-medium mb-3 flex items-center">
                              <Bitcoin className="h-4 w-4 mr-2 text-primary" />
                              {locale === 'ru' ? 'Выберите криптовалюту' : 'Select cryptocurrency'}
                            </h4>
                            <CryptoCurrencySelector
                              value={selectedCryptoCurrency}
                              onChange={setSelectedCryptoCurrency}
                              supportedCurrencies={
                                paymentProviders.find(
                                  (p: PaymentProviderOption) => p.id === 'crypto',
                                )?.credentials?.supported_currencies || 'ETH,USDT,DAI'
                              }
                              className="mb-3"
                            />
                            <p className="text-xs text-muted-foreground mt-2 bg-primary/5 p-2 rounded-md">
                              {locale === 'ru'
                                ? 'Обратите внимание, что платеж будет в выбранной валюте. Курс конвертации будет зафиксирован в момент оплаты.'
                                : 'Note: Payment will be in the selected currency. The exchange rate will be fixed at the time of payment.'}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between border-t pt-4 px-6 pb-6">
                    <Button
                      variant="outline"
                      onClick={() => goToStep('contact')}
                      className="flex items-center gap-2 hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      {locale === 'ru' ? 'Назад' : 'Back'}
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={handleCheckout}
                      disabled={
                        isLoading || !isEmailValid || isLoadingProviders || !selectedProvider
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>{locale === 'ru' ? 'Обработка...' : 'Processing...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{locale === 'ru' ? 'Оплатить' : 'Pay now'}</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>

                  {error && (
                    <div className="px-6 pb-6 -mt-2">
                      <Alert variant="destructive" className="text-sm">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <path d="M12 9v4" />
                            <path d="M12 17h.01" />
                          </svg>
                          {error}
                        </div>
                      </Alert>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          {/* Сводка заказа - улучшена для мобильной адаптации */}
          <div className="sticky top-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="border-muted/60 dark:border-muted/30 shadow-md dark:shadow-sm dark:shadow-primary/5 overflow-hidden">
                <CardHeader className="border-b bg-card/60 backdrop-blur-sm">
                  <CardTitle className="flex items-center text-xl">
                    <ShoppingBasket className="h-5 w-5 mr-2 text-primary" />
                    {locale === 'ru' ? 'Ваш заказ' : 'Order Summary'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {locale === 'ru'
                      ? `${currentCartItems.length} ${
                          currentCartItems.length === 1
                            ? 'товар'
                            : currentCartItems.length < 5
                              ? 'товара'
                              : 'товаров'
                        }`
                      : `${currentCartItems.length} ${currentCartItems.length === 1 ? 'item' : 'items'}`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="space-y-3 max-h-[200px] overflow-auto py-1 pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                      {currentCartItems.slice(0, 3).map((item: CartItemType) => {
                        const itemId =
                          item.itemType === 'service'
                            ? typeof item.service === 'string'
                              ? item.service
                              : item.service?.id
                            : typeof item.product === 'string'
                              ? item.product
                              : item.product?.id
                        // const title = getItemTitle(item) // getItemTitle is internal to DetailedCartItemsList or handled by its props

                        // Simplified summary display, as detailed list is above
                        // For a more consistent look, you might want to extract a "CartItemSummaryRow" component too.
                        // For now, let's keep it simple.
                        const entity = item.itemType === 'service' ? item.service : item.product
                        let title = item.itemType === 'service' ? 'Service' : 'Product'
                        if (entity && typeof entity !== 'string' && entity.title) {
                          if (typeof entity.title === 'object' && entity.title !== null) {
                            const localizedTitle =
                              (entity.title as any)[locale] || (entity.title as any).en
                            if (localizedTitle) title = String(localizedTitle)
                          } else if (typeof entity.title === 'string') {
                            title = entity.title
                          }
                        }

                        return (
                          <div
                            key={`summary-item-${item.itemType}-${itemId ?? 'unknown'}`}
                            className="flex justify-between items-center text-sm py-1.5 border-b border-dashed border-muted/50 last:border-0 group"
                          >
                            <div className="flex-1 truncate group-hover:text-primary transition-colors">
                              <span className="font-medium">{title}</span>
                              {item.quantity > 1 && (
                                <span className="text-muted-foreground ml-1 text-xs">
                                  × {item.quantity}
                                </span>
                              )}
                            </div>
                            <div className="font-medium tabular-nums">
                              {formatPrice(
                                (item.priceSnapshot || 0) * (item.quantity || 0),
                                locale,
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {currentCartItems.length > 3 && (
                        <div className="text-sm text-muted-foreground text-center py-1.5 bg-muted/20 rounded">
                          {locale === 'ru'
                            ? `+ ещё ${currentCartItems.length - 3} ${currentCartItems.length - 3 === 1 ? 'позиция' : 'позиций'}`
                            : `+ ${currentCartItems.length - 3} more ${currentCartItems.length - 3 === 1 ? 'item' : 'items'}`}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {locale === 'ru' ? 'Подытог' : 'Subtotal'}
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatPrice(total, locale)}
                        </span>
                      </div>

                      {/* Секция скидки */}
                      <div className="pt-2">
                        {appliedDiscount ? (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex justify-between items-center text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-900/30 mb-3"
                          >
                            <span className="text-green-700 dark:text-green-400 flex items-center">
                              <BadgePercent className="h-4 w-4 mr-2" />
                              {locale === 'ru' ? 'Скидка' : 'Discount'}: {appliedDiscount.code}
                              {appliedDiscount.percentage && ` (${appliedDiscount.percentage}%)`}
                            </span>
                            <div className="flex items-center">
                              <span className="font-medium text-green-700 dark:text-green-400 mr-2 tabular-nums">
                                -{formatPrice(appliedDiscount.amount, locale)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                                onClick={handleRemoveDiscount}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mb-5 bg-muted/40 rounded-lg p-5 border border-muted/60"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Label
                                htmlFor="discount-code"
                                className="text-base font-medium flex items-center"
                              >
                                <BadgePercent className="h-5 w-5 mr-2 text-primary" />
                                {locale === 'ru' ? 'Есть промокод?' : 'Have a promo code?'}
                              </Label>
                            </div>
                            <div className="flex flex-col gap-3">
                              <Input
                                id="discount-code"
                                type="text"
                                placeholder={
                                  locale === 'ru' ? 'Введите код скидки' : 'Enter discount code'
                                }
                                value={discountCode}
                                onChange={handleDiscountCodeChange}
                                className="h-12 text-base bg-background px-4 w-full rounded-md font-medium"
                                disabled={isApplyingDiscount}
                              />
                              <Button
                                type="button"
                                variant="default"
                                className="h-10 px-4 text-base bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-md w-full rounded-md"
                                onClick={handleApplyDiscount}
                                disabled={isApplyingDiscount || !discountCode.trim()}
                              >
                                {isApplyingDiscount ? (
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                  <BadgePercent className="h-5 w-5 mr-2" />
                                )}
                                {isApplyingDiscount
                                  ? locale === 'ru'
                                    ? 'Применение...'
                                    : 'Applying...'
                                  : locale === 'ru'
                                    ? 'Применить промокод'
                                    : 'Apply promo code'}
                              </Button>
                            </div>
                            {discountError && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-destructive mt-3 flex items-center bg-destructive/10 p-3 rounded"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" x2="12" y1="8" y2="12" />
                                  <line x1="12" x2="12.01" y1="16" y2="16" />
                                </svg>
                                {discountError}
                              </motion.p>
                            )}
                          </motion.div>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-medium">
                          <span>{locale === 'ru' ? 'Итого' : 'Total'}</span>
                          <div className="flex flex-col items-end">
                            {appliedDiscount && appliedDiscount.amount > 0 && (
                              <span className="text-sm line-through text-muted-foreground mb-1 tabular-nums">
                                {formatPrice(total, locale)}
                              </span>
                            )}
                            <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 tabular-nums font-bold">
                              {formatPrice(
                                appliedDiscount && typeof appliedDiscount.amount === 'number'
                                  ? Math.max(0, total - appliedDiscount.amount)
                                  : total,
                                locale,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex-col space-y-4 pt-0 px-6 pb-6 bg-muted/5">
                  {activeStep === 'payment' ? (
                    <p className="text-xs text-muted-foreground text-center">
                      {locale === 'ru' ? (
                        <>
                          Оплачивая заказ, вы соглашаетесь с{' '}
                          <a href={`/${locale}/terms`} className="text-primary hover:underline">
                            условиями обслуживания
                          </a>{' '}
                          и{' '}
                          <a href={`/${locale}/privacy`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                            политикой конфиденциальности
                          </a>
                        </>
                      ) : (
                        <>
                          By completing your purchase, you agree to our{' '}
                          <a href={`/${locale}/terms`} className="text-primary hover:underline">
                            terms of service
                          </a>{' '}
                          and{' '}
                          <a href={`/${locale}/privacy`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                            privacy policy
                          </a>
                        </>
                      )}
                    </p>
                  ) : (
                    <div className="w-full">
                      {activeStep === 'cart' ? (
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
                          onClick={goToNextStep}
                          disabled={currentCartItems.length === 0}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            {locale === 'ru' ? 'Продолжить' : 'Continue'}
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </motion.div>
                          </span>
                        </Button>
                      ) : (
                        activeStep === 'contact' && (
                          <Button
                            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={goToNextStep}
                            disabled={!isEmailValid}
                          >
                            {locale === 'ru' ? 'Продолжить к оплате' : 'Continue to payment'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Баннер с информацией о безопасности платежа */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-12 bg-muted/30 rounded-xl p-4 border border-muted/50 text-center"
      >
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-primary"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {locale === 'ru' ? 'Безопасная оплата' : 'Secure Payment'}
          </div>
          <span className="hidden sm:inline mx-2">•</span>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-primary"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            {locale === 'ru' ? 'Защита данных' : 'Data Protection'}
          </div>
          <span className="hidden sm:inline mx-2">•</span>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            {locale === 'ru' ? 'Надежная доставка' : 'Reliable Delivery'}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
