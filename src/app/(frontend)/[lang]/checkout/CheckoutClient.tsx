'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useCart } from '@/providers/CartProvider'
// import { useTranslations } from '@/hooks/useTranslations' // Temporarily remove to isolate issues
import { formatPrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'
import { Button } from '@/components/ui/button'
import { X, CreditCard, Wallet, ArrowRight, ShoppingBag, Loader2, Bitcoin } from 'lucide-react'
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

export default function CheckoutClient({ locale }: CheckoutClientProps) {
  const {
    cart,
    total = 0,
    clear: clearCart = () => {},
    remove: removeFromCart = () => {},
  } = useCart()
  // const t = useTranslations(locale); // Temporarily using hardcoded strings

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
      setDiscountError('Enter a discount code')
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
        setDiscountError(data.message || 'Invalid discount code')
        return
      }

      setAppliedDiscount({
        code: discountCode,
        amount: data.discountAmount,
        percentage: data.discountPercentage,
      })
      setDiscountCode('')
    } catch (errCatch) {
      console.error('Error applying discount:', errCatch)
      setDiscountError(errCatch instanceof Error ? errCatch.message : 'Error applying discount')
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

      const paymentData = {
        items: paymentDataItems,
        customer: {
          email,
          locale,
        },
        provider: provider,
        returnUrl: `${window.location.origin}/${locale}/payment/success`,
        ...cryptoSpecificData,
        ...(appliedDiscount && {
          discount: {
            code: appliedDiscount.code,
            amount: appliedDiscount.amount,
          },
        }),
      }

      const response = await fetch('/api/v1/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      const { paymentUrl } = await response.json()

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

  const currentCartItems = cart?.items || []

  type CartItemType = NonNullable<CartSession['items']>[0]

  const getItemTitle = (item: CartItemType): string => {
    const entity = item.itemType === 'service' ? item.service : item.product
    if (entity && typeof entity !== 'string' && entity.title) {
      if (typeof entity.title === 'object' && entity.title !== null) {
        const localizedTitle = (entity.title as any)[locale] || (entity.title as any).en
        if (localizedTitle) return String(localizedTitle)
      } else if (typeof entity.title === 'string') {
        return entity.title
      }
    }
    return item.itemType === 'service' ? 'Service' : 'Product'
  }

  const getItemImageUrl = (item: CartItemType): string | null => {
    if (item.itemType === 'service' && item.service && typeof item.service !== 'string') {
      const service = item.service as Service
      if (service.thumbnail && typeof service.thumbnail !== 'string') {
        return (service.thumbnail as Media).url || null
      }
    } else if (item.itemType === 'product' && item.product && typeof item.product !== 'string') {
      const product = item.product as Product
      if (product.thumbnail && typeof product.thumbnail !== 'string') {
        return (product.thumbnail as Media).url || null
      }
      if (product.gallery && product.gallery.length > 0 && product.gallery[0]?.image) {
        const firstImageInGallery = product.gallery[0].image
        if (firstImageInGallery && typeof firstImageInGallery !== 'string') {
          return (firstImageInGallery as Media).url || null
        }
      }
    }
    return null
  }

  if (currentCartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 flex justify-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-2">
          {locale === 'ru' ? 'Ваша корзина пуста' : 'Your cart is empty'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {locale === 'ru'
            ? 'Добавьте товары в корзину, чтобы продолжить'
            : 'Add some items to your cart to continue'}
        </p>
        <Button asChild>
          <a href={`/${locale}/products`}>
            {locale === 'ru' ? 'Перейти к товарам' : 'Browse products'}
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'ru' ? 'Корзина товаров' : 'Shopping Cart'}</CardTitle>
            <CardDescription>
              {currentCartItems.length === 0
                ? locale === 'ru'
                  ? 'Ваша корзина пуста'
                  : 'Your cart is empty'
                : `${currentCartItems.length} ${currentCartItems.length === 1 ? (locale === 'ru' ? 'товар' : 'item') : locale === 'ru' ? (currentCartItems.length < 5 ? 'товара' : 'товаров') : 'items'} ${locale === 'ru' ? 'в корзине' : 'in your cart'}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {currentCartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {locale === 'ru'
                    ? 'Ваша корзина пуста. Добавьте товары для оформления заказа.'
                    : 'Your cart is empty. Add some products to proceed with checkout.'}
                </p>
                <Button className="mt-4" asChild>
                  <a href={`/${locale}`}>
                    {locale === 'ru' ? 'Перейти к покупкам' : 'Continue shopping'}
                  </a>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {currentCartItems.map((item: CartItemType) => {
                  const itemId =
                    item.itemType === 'service'
                      ? typeof item.service === 'string'
                        ? item.service
                        : item.service?.id
                      : typeof item.product === 'string'
                        ? item.product
                        : item.product?.id
                  const imageUrl = getItemImageUrl(item)
                  const title = getItemTitle(item)

                  return (
                    <div
                      key={`cart-item-${item.itemType}-${itemId}`}
                      className="py-3 flex justify-between"
                    >
                      <div className="flex items-start">
                        <div className="mr-3 relative h-16 w-16 rounded-md overflow-hidden">
                          {imageUrl ? (
                            <Image src={imageUrl} alt={title} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {title}
                            {(item.quantity || 0) > 1 && ` × ${item.quantity}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {locale === 'ru' ? 'Кол-во' : 'Qty'}: {item.quantity || 0}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatPrice(
                          (item.priceSnapshot || 0) * (item.quantity || 0),
                          locale === 'ru' ? 'RUB' : 'USD',
                        )}
                      </p>
                    </div>
                  )
                })}
                <div className="pt-3 space-y-2">
                  <div key="subtotal" className="flex justify-between">
                    <p className="text-muted-foreground">
                      {locale === 'ru' ? 'Подытог' : 'Subtotal'}
                    </p>
                    <p>{formatPrice(total, locale === 'ru' ? 'RUB' : 'USD')}</p>
                  </div>

                  <div className="mt-4 mb-2">
                    <Label htmlFor="discount-code" className="text-sm">
                      {locale === 'ru' ? 'Код скидки' : 'Discount code'}
                    </Label>
                    <div className="flex mt-1">
                      <Input
                        id="discount-code"
                        type="text"
                        placeholder={locale === 'ru' ? 'Введите код' : 'Enter code'}
                        value={discountCode}
                        onChange={handleDiscountCodeChange}
                        className="rounded-r-none"
                        disabled={isApplyingDiscount || !!appliedDiscount}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-l-none"
                        onClick={handleApplyDiscount}
                        disabled={isApplyingDiscount || !!appliedDiscount || !discountCode.trim()}
                      >
                        {isApplyingDiscount ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : locale === 'ru' ? (
                          'Применить'
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                    {discountError && (
                      <p className="text-sm text-destructive mt-1">{discountError}</p>
                    )}
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between items-center text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-green-700 dark:text-green-300">
                          {locale === 'ru' ? 'Скидка' : 'Discount'}: {appliedDiscount.code}
                          {appliedDiscount.percentage && ` (${appliedDiscount.percentage}%)`}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-green-700 dark:text-green-300 mr-2">
                          -{formatPrice(appliedDiscount.amount, locale === 'ru' ? 'RUB' : 'USD')}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={handleRemoveDiscount}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div key="separator" className="border-t my-2" />
                  <div key="total" className="flex justify-between font-medium">
                    <p>{locale === 'ru' ? 'Итого' : 'Total'}</p>
                    <p>
                      {formatPrice(
                        appliedDiscount && typeof appliedDiscount.amount === 'number'
                          ? total - appliedDiscount.amount
                          : total,
                        locale === 'ru' ? 'RUB' : 'USD',
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {locale === 'ru' ? 'Контактная информация' : 'Contact information'}
            </CardTitle>
            <CardDescription>
              {locale === 'ru'
                ? 'Укажите email для получения товара и чека'
                : 'Enter your email to receive the product and receipt'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={cn(
                    'transition-colors duration-200',
                    email.length > 0 && !isEmailValid
                      ? 'border-2 border-destructive focus:border-destructive focus:ring-destructive/40 focus-visible:outline-none'
                      : email.length > 0 && isEmailValid
                        ? 'border-2 border-green-500 focus:border-green-500 focus:ring-accent/40 focus-visible:outline-none'
                        : 'hover:border-accent/50 focus:border-2 focus:border-accent/50 focus:ring-accent/30 focus-visible:outline-none',
                  )}
                  required
                />
                {emailError && <p className="text-sm text-destructive mt-1">{emailError}</p>}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {locale === 'ru'
                    ? 'Для цифровых продуктов адрес доставки не требуется'
                    : 'No shipping address required for digital products'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'ru' ? 'Способ оплаты' : 'Payment Method'}</CardTitle>
            <CardDescription>
              {locale === 'ru'
                ? 'Выберите удобный способ оплаты'
                : 'Select your preferred payment method'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoadingProviders ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : paymentProviders.length === 0 ? (
              <div className="p-4 border border-destructive bg-destructive/10 rounded-md mb-4">
                <h4 className="font-medium text-destructive mb-1">
                  {locale === 'ru' ? 'Способы оплаты недоступны' : 'Payment Methods Unavailable'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ru'
                    ? 'В настоящее время способы оплаты недоступны. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.'
                    : 'Payment methods are currently unavailable. Please try again later or contact support.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentProviders.map((provider: PaymentProviderOption, index: number) => {
                  const providerId = provider.id || `provider-${index}`
                  let providerIcon = null
                  if (providerId === 'yoomoney') {
                    providerIcon = <CreditCard className="mr-2 h-5 w-5 text-yellow-500" />
                  } else if (providerId === 'robokassa') {
                    providerIcon = <Wallet className="mr-2 h-5 w-5 text-blue-500" />
                  } else if (providerId === 'stripe') {
                    providerIcon = <CreditCard className="mr-2 h-5 w-5 text-purple-500" />
                  } else if (providerId === 'paypal') {
                    providerIcon = <Wallet className="mr-2 h-5 w-5 text-blue-700" />
                  } else if (providerId === 'crypto') {
                    providerIcon = <Bitcoin className="mr-2 h-5 w-5 text-green-500" />
                  }

                  return (
                    <div
                      key={`payment-provider-${providerId}-${index}`}
                      className={cn(
                        'flex items-center space-x-3 border rounded-md p-4 cursor-pointer transition-colors',
                        selectedProvider === providerId
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-accent',
                      )}
                      onClick={() => setSelectedProvider(providerId)}
                    >
                      <input
                        type="radio"
                        id={`payment-method-${providerId}-${index}`}
                        name="payment-provider"
                        value={providerId}
                        checked={selectedProvider === providerId}
                        onChange={() => setSelectedProvider(providerId)}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <label
                        htmlFor={`payment-method-${providerId}-${index}`}
                        className="flex-1 flex items-center cursor-pointer pl-2"
                      >
                        {providerIcon}
                        <span>{provider.name || 'Unknown Provider'}</span>
                      </label>
                    </div>
                  )
                })}

                {selectedProvider === 'crypto' && (
                  <div className="ml-8 mt-3">
                    <CryptoCurrencySelector
                      value={selectedCryptoCurrency}
                      onChange={setSelectedCryptoCurrency}
                      supportedCurrencies={
                        paymentProviders.find((p: PaymentProviderOption) => p.id === 'crypto')
                          ?.credentials?.supported_currencies || 'ETH,USDT,DAI'
                      }
                      className="mb-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ru'
                        ? 'Обратите внимание, что платеж будет в выбранной валюте'
                        : 'Note: Payment will be in the selected currency'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={
                isLoading ||
                currentCartItems.length === 0 ||
                !isEmailValid ||
                isLoadingProviders ||
                !selectedProvider
              }
            >
              {isLoading ? (
                <React.Fragment key="loading-state">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>{locale === 'ru' ? 'Обработка...' : 'Processing...'}</span>
                </React.Fragment>
              ) : (
                <React.Fragment key="ready-state">
                  <span>{locale === 'ru' ? 'Оплатить заказ' : 'Pay now'}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </React.Fragment>
              )}
            </Button>

            {error && (
              <div className="p-3 border border-destructive bg-destructive/10 rounded-md text-sm text-destructive">
                {error}
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              {locale === 'ru'
                ? 'Оплачивая заказ, вы соглашаетесь с условиями обслуживания и политикой конфиденциальности'
                : 'By completing your purchase, you agree to our terms of service and privacy policy'}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
