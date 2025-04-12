'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Order } from '@/payload-types'
import { formatCurrency } from '@/utilities/formatCurrency'

interface OrderTrackingProps {
  orderId: string
}

const orderStatuses = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  // Removed shipped status as we only have digital products
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

export function OrderTracking({ orderId }: OrderTrackingProps) {
  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/orders/${orderId}`)
      if (!response.ok) throw new Error('Failed to fetch order')
      return response.json()
    },
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading order details...</div>
  }

  if (error || !order) {
    return <div className="text-center py-8 text-red-600">Failed to load order details</div>
  }

  const status = orderStatuses[order.status] || orderStatuses.pending

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full ${status.color}`}>{status.label}</span>
      </div>

      <div className="border-t border-gray-200 py-4">
        <h3 className="font-semibold mb-3">Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {order.trackingNumber && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Tracking Information</h3>
          <p>Tracking Number: {order.trackingNumber}</p>
        </div>
      )}
    </div>
  )
}
