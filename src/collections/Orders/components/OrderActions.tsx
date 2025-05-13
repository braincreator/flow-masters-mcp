import React, { useState } from 'react'
import { useField, Button, useConfig } from '@payloadcms/ui'
import type { FieldClientComponent, UIField } from 'payload'

// const OrderActions: FieldClientComponent<UIField, any> = (props: FieldProps<void, UIField, any>) => { // Reverting this change
const OrderActions: FieldClientComponent = (props) => {
  // Restoring to the state after your first fix
  // const { path, field } = props;
  // const { serverURL } = useConfig();
  const { value: orderId } = useField<string>({ path: 'id' })
  const { value: orderCurrency } = useField<string>({ path: 'currency' })
  // const { value: orderStatus } = useField<string>({ path: 'status' }); // For conditional disabling

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleRefund = async () => {
    if (!orderId || !orderCurrency) {
      setMessage({ type: 'error', text: 'Order ID or currency is missing.' })
      return
    }

    setIsLoading(true)
    setMessage(null)
    try {
      // Using absolute path to the endpoint. Fetch will use the current origin.
      const response = await fetch(`/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency: orderCurrency }), // Send currency for full refund
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Refund processed successfully!' })
        // Optionally, trigger a form refresh or data reload here
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Refund failed.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while processing the refund.' })
      console.error('Refund error:', error)
    }
    setIsLoading(false)
  }

  const handleVoid = async () => {
    if (!orderId) {
      setMessage({ type: 'error', text: 'Order ID is missing.' })
      return
    }
    setIsLoading(true)
    setMessage(null)
    try {
      // Using absolute path to the endpoint. Fetch will use the current origin.
      const response = await fetch(`/orders/${orderId}/void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ reason: 'Admin initiated void' }), // Optional reason
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Void processed successfully!' })
        // Optionally, trigger a form refresh or data reload here
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Void failed.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while processing the void.' })
      console.error('Void error:', error)
    }
    setIsLoading(false)
  }

  return (
    <div
      style={{
        marginTop: '20px',
        marginBottom: '20px',
        borderTop: '1px solid #666',
        paddingTop: '20px',
      }}
    >
      <h3>Order Actions</h3>
      {message && (
        <div
          style={{
            padding: '10px',
            marginBottom: '10px',
            border: `1px solid ${message.type === 'success' ? 'green' : 'red'}`,
            color: message.type === 'success' ? 'green' : 'red',
            backgroundColor: message.type === 'success' ? '#e6ffed' : '#ffe6e6',
          }}
        >
          {message.text}
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button
          onClick={handleRefund}
          disabled={isLoading}
          // TODO: Add more sophisticated disabling logic based on orderStatus
          // For example, disable if orderStatus is 'refunded', 'cancelled', 'pending'
        >
          {isLoading ? 'Processing...' : 'Refund Full Order'}
        </Button>
        <Button
          onClick={handleVoid}
          buttonStyle="secondary"
          disabled={isLoading}
          // TODO: Add more sophisticated disabling logic based on orderStatus
          // For example, disable if orderStatus is not 'paid' or 'processing' (depends on void logic)
        >
          {isLoading ? 'Processing...' : 'Void Order'}
        </Button>
      </div>
      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
        Note: Ensure payment provider supports these actions. Robokassa/Crypto may require manual
        steps.
      </p>
    </div>
  )
}

export default OrderActions
