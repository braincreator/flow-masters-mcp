'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'

export function Checkout() {
  const { cart, total } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('yoomoney')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: cart.map(item => item.id),
          email: 'customer@example.com', // Replace with actual user email
          paymentMethod,
        }),
      })

      const { paymentUrl } = await response.json()
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="yoomoney"
              checked={paymentMethod === 'yoomoney'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            YooMoney
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="robokassa"
              checked={paymentMethod === 'robokassa'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            Robokassa
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <div className="mt-2">
          <p>Total Items: {cart.length}</p>
          <p className="text-xl font-bold">Total: ${total}</p>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || cart.length === 0}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:bg-gray-300"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </div>
  )
}