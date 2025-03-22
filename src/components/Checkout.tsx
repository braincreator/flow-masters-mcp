'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { CartSummary } from '@/components/CartSummary'

export function Checkout() {
  const { cart, total } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('yoomoney')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    try {
      setError(null)
      setLoading(true)
      
      if (cart.length === 0) {
        throw new Error('Cart is empty')
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
          })),
          email: 'customer@example.com', // Replace with actual user email
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Checkout failed')
      }

      const { paymentUrl } = await response.json()
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded hover:bg-gray-50">
              <input
                type="radio"
                value="yoomoney"
                checked={paymentMethod === 'yoomoney'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span>YooMoney</span>
            </label>
            <label className="flex items-center p-3 border rounded hover:bg-gray-50">
              <input
                type="radio"
                value="robokassa"
                checked={paymentMethod === 'robokassa'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span>Robokassa</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>

      <div>
        <CartSummary />
      </div>
    </div>
  )
}
