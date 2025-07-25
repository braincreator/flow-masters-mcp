'use client'

import { useState } from 'react'
import { useCart } from '@/providers/CartProvider'
import { CartSummary } from '@/components/CartSummary'
import { useTranslations } from 'next-intl'
import { Locale } from '@/constants'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface CheckoutProps {
  locale: Locale
  onBack?: () => void
  onCheckoutSuccess?: () => void
}

export function Checkout({ locale, onBack, onCheckoutSuccess }: CheckoutProps) {
  const t = useTranslations('Checkout')
  const { cart, total, clear } = useCart() // Added clear from useCart
  const [paymentMethod, setPaymentMethod] = useState('yoomoney')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    try {
      setError(null)
      setLoading(true)

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error(t('errorCartEmpty'))
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            id: typeof item.product === 'string' ? item.product : item.product?.id,
            quantity: item.quantity,
          })),
          email: 'customer@example.com', // Replace with actual user email
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t('errorCheckoutFailedDefault'))
      }

      const { paymentUrl } = await response.json()
      // Instead of redirecting, call onCheckoutSuccess
      if (onCheckoutSuccess) {
        onCheckoutSuccess()
      } else {
        // Fallback if no handler, though ideally Cart.tsx handles this
        window.location.href = paymentUrl
      }
      // Optionally clear cart after initiating payment
      // await clear();
    } catch (error) {
      logError('Checkout error:', error)
      setError(error instanceof Error ? error.message : t('errorCheckoutFailedDefault'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{t('selectPaymentMethodTitle')}</h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded hover:bg-gray-50">
              <input
                type="radio"
                value="yoomoney"
                checked={paymentMethod === 'yoomoney'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span>{t('paymentMethodYooMoney')}</span>
            </label>
            <label className="flex items-center p-3 border rounded hover:bg-gray-50">
              <input
                type="radio"
                value="robokassa"
                checked={paymentMethod === 'robokassa'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span>{t('paymentMethodRobokassa')}</span>
            </label>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <button
          onClick={handleCheckout}
          disabled={loading || !cart || !cart.items || cart.items.length === 0}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? t('processingButton') : t('proceedButton')}
        </button>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-800"
          >
            {t('backToCartButton', { defaultValue: 'Back to Cart' })}
          </button>
        )}
      </div>

      <div>
        <CartSummary locale={locale} />
      </div>
    </div>
  )
}
