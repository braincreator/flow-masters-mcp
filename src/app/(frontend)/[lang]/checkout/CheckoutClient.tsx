'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { useTranslations } from '@/hooks/useTranslations'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utilities/ui'
import { PaymentProvider } from '@/types/payment'
import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import CryptoCurrencySelector from '@/components/CryptoCurrencySelector'

// Validate email format
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface CheckoutClientProps {
  locale: Locale
}

export default function CheckoutClient({ locale }: CheckoutClientProps) {
  const { items, removeFromCart, clearCart, total } = useCart()
  const t = useTranslations(locale)

  const [email, setEmail] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [paymentProviders, setPaymentProviders] = useState<Array<{ id: string; name: string }>>([])
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [isLoadingProviders, setIsLoadingProviders] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Добавляем состояние для кода скидки
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    amount: number
    percentage?: number
  } | null>(null)
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState<string | null>(null)

  // No shipping address fields needed for digital products

  // Add state for selected crypto currency
  const [selectedCryptoCurrency, setSelectedCryptoCurrency] = useState('ETH')

  useEffect(() => {
    // Fetch available payment providers
    const fetchProviders = async () => {
      setIsLoadingProviders(true)
      try {
        const response = await fetch('/api/v1/payment/providers')
        if (!response.ok) throw new Error('Failed to fetch payment providers')
        const data = await response.json()
        let providersData = data.providers || []
        let defaultProviderId = data.defaultProvider

        // Only use providers that exist and are enabled
        providersData = providersData.filter((provider) => provider && provider.enabled !== false)

        // If API returned empty list, don't fall back to defaults since we only want to show enabled providers
        if (!providersData || providersData.length === 0) {
          console.warn('No enabled payment providers found')
          providersData = []
          defaultProviderId = null
        }

        // Ensure all providers have valid IDs
        providersData = providersData.map((provider, index) => ({
          id: provider.id || `provider-${index}`,
          name: provider.name || `Provider ${index + 1}`,
          credentials: provider.credentials || {},
        }))

        setPaymentProviders(providersData)

        // Set default provider if it exists and is enabled
        if (defaultProviderId && providersData.some((p) => p.id === defaultProviderId)) {
          setSelectedProvider(defaultProviderId)
        } else if (providersData.length > 0) {
          setSelectedProvider(providersData[0].id)
        } else {
          setSelectedProvider(null)
        }
      } catch (error) {
        console.error('Error fetching payment providers:', error)
        // Don't use fallback providers - only show what's enabled
        setPaymentProviders([])
        setSelectedProvider(null)
      } finally {
        setIsLoadingProviders(false)
      }
    }

    fetchProviders()
  }, [])

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
      setDiscountError(locale === 'ru' ? 'Введите код скидки' : 'Enter a discount code')
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
          data.message ||
            (locale === 'ru' ? 'Недействительный код скидки' : 'Invalid discount code'),
        )
        return
      }

      setAppliedDiscount({
        code: discountCode,
        amount: data.discountAmount,
        percentage: data.discountPercentage,
      })

      // Очищаем поле ввода после успешного применения
      setDiscountCode('')
    } catch (err) {
      console.error('Error applying discount:', err)
      setDiscountError(
        err instanceof Error
          ? err.message
          : locale === 'ru'
            ? 'Ошибка при применении скидки'
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
    // Reset errors before checking
    setError(null)
    setEmailError(null)

    // Check for email
    if (!email) {
      setEmailError(locale === 'ru' ? 'Пожалуйста, укажите email' : 'Please enter your email')
      return
    }

    // Check email format
    if (!isEmailValid) {
      setEmailError(
        locale === 'ru'
          ? 'Пожалуйста, укажите корректный email (например, name@example.com)'
          : 'Please enter a valid email address (e.g., name@example.com)',
      )
      return
    }

    // No shipping address validation needed for digital products

    // Check if a payment provider is selected
    if (!selectedProvider) {
      setError(
        locale === 'ru' ? 'Пожалуйста, выберите способ оплаты' : 'Please select a payment method',
      )
      return
    }

    try {
      setIsLoading(true)

      // Find the selected provider object
      const provider = paymentProviders.find((p) => p.id === selectedProvider)

      if (!provider) {
        throw new Error(
          locale === 'ru'
            ? 'Выбранный способ оплаты недоступен'
            : 'Selected payment method is unavailable',
        )
      }

      // Modify the paymentData to include crypto currency if crypto provider is selected
      const paymentData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customer: {
          email,
          locale,
          // No address needed for digital products
        },
        provider: provider,
        returnUrl: `${window.location.origin}/${locale}/payment/success`,
        ...(provider.id === 'crypto' && {
          selectedCurrency: selectedCryptoCurrency,
        }),
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

      const { paymentUrl, orderId, orderNumber } = await response.json()

      // Clear cart and redirect to payment page
      clearCart()
      window.location.href = paymentUrl
    } catch (err) {
      console.error('Checkout error:', err)
      setError(
        err instanceof Error
          ? err.message
          : locale === 'ru'
            ? 'Ошибка при оформлении заказа'
            : 'Checkout error occurred',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getProductTitle = (product: any) => {
    if (typeof product.title === 'object') {
      return product.title[locale] || product.title.en || 'Product'
    }
    return product.title || 'Product'
  }

  if (items.length === 0) {
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
      {/* Left column - Cart items */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'ru' ? 'Корзина товаров' : 'Shopping Cart'}</CardTitle>
            <CardDescription>
              {items.length === 0
                ? locale === 'ru'
                  ? 'Ваша корзина пуста'
                  : 'Your cart is empty'
                : locale === 'ru'
                  ? `${items.length} ${
                      items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'
                    } в корзине`
                  : `${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {items.length === 0 ? (
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
                {/* Cart items */}
                {items.map((item) => (
                  <div key={`cart-item-${item.product.id}`} className="py-3 flex justify-between">
                    <div className="flex items-start">
                      <div className="mr-3 relative h-16 w-16 rounded-md overflow-hidden">
                        {item.product.images?.[0]?.url ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={getProductTitle(item.product)}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {getProductTitle(item.product)}
                          {item.quantity > 1 && ` × ${item.quantity}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {locale === 'ru' ? 'Кол-во' : 'Qty'}: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatPrice(
                        item.product.price * item.quantity,
                        locale === 'ru' ? 'RUB' : 'USD',
                      )}
                    </p>
                  </div>
                ))}

                {/* Order summary */}
                <div className="pt-3 space-y-2">
                  <div key="subtotal" className="flex justify-between">
                    <p className="text-muted-foreground">
                      {locale === 'ru' ? 'Подытог' : 'Subtotal'}
                    </p>
                    <p>{formatPrice(total, locale === 'ru' ? 'RUB' : 'USD')}</p>
                  </div>

                  {/* Discount code input */}
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

                  {/* Applied discount */}
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

                  {/* No shipping row needed for digital products */}
                  <div key="separator" className="border-t my-2" />
                  <div key="total" className="flex justify-between font-medium">
                    <p>{locale === 'ru' ? 'Итого' : 'Total'}</p>
                    <p>
                      {formatPrice(
                        appliedDiscount ? total - appliedDiscount.amount : total,
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

              {/* Shipping address section removed - not needed for digital products */}
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

      {/* Right column - Payment method and summary */}
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
                {paymentProviders.map((provider, index) => {
                  // Ensure provider has unique ID
                  const providerId = provider.id || `provider-${index}`

                  // Determine which icon to show based on provider ID
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

                {/* Show crypto currency selector when crypto payment is selected */}
                {selectedProvider === 'crypto' && (
                  <div className="ml-8 mt-3">
                    <CryptoCurrencySelector
                      value={selectedCryptoCurrency}
                      onChange={setSelectedCryptoCurrency}
                      supportedCurrencies={
                        paymentProviders.find((p) => p.id === 'crypto')?.credentials
                          ?.supported_currencies || 'ETH,USDT,DAI'
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
                items.length === 0 ||
                !isEmailValid ||
                isLoadingProviders ||
                !selectedProvider
              }
            >
              {isLoading ? (
                /* Loading state */
                <React.Fragment key="loading-state">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>{locale === 'ru' ? 'Обработка...' : 'Processing...'}</span>
                </React.Fragment>
              ) : (
                /* Ready state */
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
