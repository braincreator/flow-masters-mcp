'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { Locale } from '@/constants'
import { formatPrice } from '@/utilities/formatPrice'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2 } from 'lucide-react'

interface PaymentProvider {
  id: string
  name: {
    en: string
    ru: string
  }
}

interface PaymentFormProps {
  locale: Locale
  email?: string
}

export function PaymentForm({ locale, email: initialEmail }: PaymentFormProps) {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [email, setEmail] = useState(initialEmail || '')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingProviders, setIsLoadingProviders] = useState(true)

  useEffect(() => {
    // Load available payment providers
    const fetchProviders = async () => {
      try {
        setIsLoadingProviders(true)
        const response = await fetch('/api/payment/providers')
        if (!response.ok) throw new Error('Failed to load payment providers')

        const data = await response.json()
        setProviders(data.providers || [])

        if (data.providers && data.providers.length > 0) {
          setSelectedProvider(data.providers[0].id)
        }
      } catch (error) {
        console.error('Error loading payment providers:', error)
        setError(
          locale === 'ru'
            ? 'Не удалось загрузить способы оплаты. Пожалуйста, попробуйте позже.'
            : 'Failed to load payment methods. Please try again later.',
        )
      } finally {
        setIsLoadingProviders(false)
      }
    }

    fetchProviders()
  }, [locale])

  const handleCheckout = async () => {
    try {
      setError(null)
      setIsLoading(true)

      if (!email) {
        throw new Error(
          locale === 'ru' ? 'Пожалуйста, укажите email адрес' : 'Please provide your email address',
        )
      }

      if (!selectedProvider) {
        throw new Error(
          locale === 'ru' ? 'Выберите способ оплаты' : 'Please select a payment method',
        )
      }

      if (items.length === 0) {
        throw new Error(locale === 'ru' ? 'Корзина пуста' : 'Your cart is empty')
      }

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          customer: {
            email,
            locale,
          },
          provider: selectedProvider,
          returnUrl: `${window.location.origin}/${locale}/payment/success`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      const { paymentUrl } = await response.json()

      // Clear cart and redirect to payment page
      clearCart()
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Checkout error:', error)
      setError(
        error instanceof Error
          ? error.message
          : locale === 'ru'
            ? 'Не удалось выполнить платеж'
            : 'Checkout failed',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProviders) {
    return (
      <Card className="p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    )
  }

  if (providers.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">
          <p className="text-red-500">
            {locale === 'ru'
              ? 'Платежные системы временно недоступны'
              : 'Payment methods are temporarily unavailable'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">
        {locale === 'ru' ? 'Оплата заказа' : 'Complete your payment'}
      </h3>

      <div className="space-y-6">
        <div>
          <Label htmlFor="email">
            {locale === 'ru' ? 'Email для получения чека' : 'Email for receipt'}
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={locale === 'ru' ? 'Ваш email' : 'Your email'}
            className="mt-1"
            required
          />
        </div>

        <div>
          <div className="mb-2">
            {locale === 'ru' ? 'Выберите способ оплаты' : 'Select payment method'}
          </div>
          <RadioGroup
            value={selectedProvider || ''}
            onValueChange={setSelectedProvider}
            className="space-y-2"
          >
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value={provider.id} id={provider.id} />
                <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                  {provider.name[locale]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>
        )}

        <div className="font-medium text-xl flex justify-between items-center">
          <span>{locale === 'ru' ? 'Итого к оплате:' : 'Total:'}</span>
          <span>{formatPrice(total, locale)}</span>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={isLoading || !selectedProvider || items.length === 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {locale === 'ru' ? 'Перейти к оплате' : 'Proceed to payment'}
        </Button>
      </div>
    </Card>
  )
}
