'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import { useCart } from '@/hooks/useContexts'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define checkout steps
export type CheckoutStep =
  | 'cart'
  | 'information'
  | 'shipping'
  | 'payment'
  | 'review'
  | 'confirmation'

// Define shipping method
export interface ShippingMethod {
  id: string
  name: string
  description?: string
  price: number
  estimatedDelivery?: string
}

// Define payment method
export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'bank_transfer' | 'other'
  name: string
  last4?: string
  expiryDate?: string
  isDefault?: boolean
}

// Define address
export interface Address {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

// Define checkout state
export interface CheckoutState {
  step: CheckoutStep
  billingAddress: Address | null
  shippingAddress: Address | null
  sameAsShipping: boolean
  shippingMethod: ShippingMethod | null
  paymentMethod: PaymentMethod | null
  email: string
  notes: string
  couponCode: string
  discountAmount: number
  taxAmount: number
  shippingAmount: number
  subtotal: number
  total: number
  orderId: string | null
  orderNumber: string | null
  orderDate: string | null
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | null
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null
}

// Define checkout context
export interface CheckoutContextType {
  // State
  checkout: CheckoutState
  isLoading: boolean
  error: Error | null

  // Navigation
  goToStep: (step: CheckoutStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void

  // Address methods
  updateShippingAddress: (address: Partial<Address>) => void
  updateBillingAddress: (address: Partial<Address>) => void
  setSameAsShipping: (value: boolean) => void

  // Shipping and payment methods
  setShippingMethod: (method: ShippingMethod) => void
  setPaymentMethod: (method: PaymentMethod) => void

  // Other checkout fields
  updateEmail: (email: string) => void
  updateNotes: (notes: string) => void
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void

  // Checkout process
  calculateTotals: () => void
  placeOrder: () => Promise<boolean>
  resetCheckout: () => void
}

// Default shipping methods
const defaultShippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery in 3-5 business days',
    price: 5.99,
    estimatedDelivery: '3-5 business days',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivery in 1-2 business days',
    price: 14.99,
    estimatedDelivery: '1-2 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next day delivery',
    price: 24.99,
    estimatedDelivery: 'Next business day',
  },
]

// Initial checkout state
const initialCheckoutState: CheckoutState = {
  step: 'cart',
  billingAddress: null,
  shippingAddress: null,
  sameAsShipping: true,
  shippingMethod: null,
  paymentMethod: null,
  email: '',
  notes: '',
  couponCode: '',
  discountAmount: 0,
  taxAmount: 0,
  shippingAmount: 0,
  subtotal: 0,
  total: 0,
  orderId: null,
  orderNumber: null,
  orderDate: null,
  paymentStatus: null,
  orderStatus: null,
}

// Create context
export const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

// Provider component
export function CheckoutProvider({ children }: { children: ReactNode }) {
  // Get cart and auth state
  const { cart = null, total: cartTotal = 0, itemCount = 0 } = useCart()
  const { user, isAuthenticated } = useAuth()

  // Checkout state
  const [checkout, setCheckout] = useState<CheckoutState>({
    ...initialCheckoutState,
    email: user?.email || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Available shipping methods
  const [availableShippingMethods] = useState<ShippingMethod[]>(defaultShippingMethods)

  // Navigation methods
  const goToStep = useCallback((step: CheckoutStep) => {
    setCheckout((prev) => ({ ...prev, step }))
  }, [])

  const goToNextStep = useCallback(() => {
    setCheckout((prev) => {
      const steps: CheckoutStep[] = [
        'cart',
        'information',
        'shipping',
        'payment',
        'review',
        'confirmation',
      ]
      const currentIndex = steps.indexOf(prev.step)

      if (currentIndex < steps.length - 1) {
        return { ...prev, step: steps[currentIndex + 1] }
      }

      return prev
    })
  }, [])

  const goToPreviousStep = useCallback(() => {
    setCheckout((prev) => {
      const steps: CheckoutStep[] = [
        'cart',
        'information',
        'shipping',
        'payment',
        'review',
        'confirmation',
      ]
      const currentIndex = steps.indexOf(prev.step)

      if (currentIndex > 0) {
        return { ...prev, step: steps[currentIndex - 1] }
      }

      return prev
    })
  }, [])

  // Address methods
  const updateShippingAddress = useCallback((address: Partial<Address>) => {
    setCheckout((prev) => ({
      ...prev,
      shippingAddress: {
        ...(prev.shippingAddress || ({} as Address)),
        ...address,
      } as Address,
    }))
  }, [])

  const updateBillingAddress = useCallback((address: Partial<Address>) => {
    setCheckout((prev) => ({
      ...prev,
      billingAddress: {
        ...(prev.billingAddress || ({} as Address)),
        ...address,
      } as Address,
    }))
  }, [])

  const setSameAsShipping = useCallback((value: boolean) => {
    setCheckout((prev) => ({
      ...prev,
      sameAsShipping: value,
      billingAddress: value ? prev.shippingAddress : prev.billingAddress,
    }))
  }, [])

  // Shipping and payment methods
  const setShippingMethod = useCallback((method: ShippingMethod) => {
    setCheckout((prev) => ({
      ...prev,
      shippingMethod: method,
      shippingAmount: method.price,
    }))
  }, [])

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setCheckout((prev) => ({
      ...prev,
      paymentMethod: method,
    }))
  }, [])

  // Other checkout fields
  const updateEmail = useCallback((email: string) => {
    setCheckout((prev) => ({ ...prev, email }))
  }, [])

  const updateNotes = useCallback((notes: string) => {
    setCheckout((prev) => ({ ...prev, notes }))
  }, [])

  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulate API call to validate coupon
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // For demo purposes, apply a fixed discount for any coupon
        const discountAmount = cartTotal * 0.1 // 10% discount

        setCheckout((prev) => ({
          ...prev,
          couponCode: code,
          discountAmount,
        }))

        toast.success('Coupon applied successfully', {
          description: `You received a discount of $${discountAmount.toFixed(2)}`,
        })

        return true
      } catch (err) {
        logError('Error applying coupon:', err)
        setError(err instanceof Error ? err : new Error('Failed to apply coupon'))

        toast.error('Failed to apply coupon', {
          description: err instanceof Error ? err.message : 'An error occurred',
        })

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [cartTotal],
  )

  const removeCoupon = useCallback(() => {
    setCheckout((prev) => ({
      ...prev,
      couponCode: '',
      discountAmount: 0,
    }))

    toast.info('Coupon removed')
  }, [])

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const subtotal = cartTotal
    const shippingAmount = checkout.shippingMethod?.price || 0
    const discountAmount = checkout.discountAmount

    // Calculate tax (example: 8% of subtotal after discount)
    const taxableAmount = Math.max(0, subtotal - discountAmount)
    const taxAmount = taxableAmount * 0.08

    // Calculate total
    const total = subtotal + shippingAmount + taxAmount - discountAmount

    setCheckout((prev) => ({
      ...prev,
      subtotal,
      shippingAmount,
      taxAmount,
      total,
    }))
  }, [cartTotal, checkout.shippingMethod?.price, checkout.discountAmount])

  // Place order
  const placeOrder = useCallback(async (): Promise<boolean> => {
    if (itemCount === 0) {
      toast.error('Your cart is empty')
      return false
    }

    if (!checkout.shippingAddress) {
      toast.error('Shipping address is required')
      return false
    }

    if (!checkout.shippingMethod) {
      toast.error('Shipping method is required')
      return false
    }

    if (!checkout.paymentMethod) {
      toast.error('Payment method is required')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call to place order
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate order ID and number
      const orderId = `order_${Date.now()}`
      const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
      const orderDate = new Date().toISOString()

      setCheckout((prev) => ({
        ...prev,
        step: 'confirmation',
        orderId,
        orderNumber,
        orderDate,
        paymentStatus: 'completed',
        orderStatus: 'processing',
      }))

      toast.success('Order placed successfully', {
        description: `Your order #${orderNumber} has been placed`,
      })

      return true
    } catch (err) {
      logError('Error placing order:', err)
      setError(err instanceof Error ? err : new Error('Failed to place order'))

      toast.error('Failed to place order', {
        description: err instanceof Error ? err.message : 'An error occurred',
      })

      return false
    } finally {
      setIsLoading(false)
    }
  }, [itemCount, checkout.shippingAddress, checkout.shippingMethod, checkout.paymentMethod])

  // Reset checkout
  const resetCheckout = useCallback(() => {
    setCheckout({
      ...initialCheckoutState,
      email: user?.email || '',
    })
    setError(null)
  }, [user?.email])

  // Update totals when relevant values change
  React.useEffect(() => {
    calculateTotals()
  }, [cartTotal, checkout.shippingMethod, checkout.discountAmount, calculateTotals])

  // Update email when user changes
  React.useEffect(() => {
    if (user?.email) {
      updateEmail(user.email)
    }
  }, [user?.email, updateEmail])

  // Memoize context value
  const value = useMemo(
    () => ({
      checkout,
      isLoading,
      error,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      updateShippingAddress,
      updateBillingAddress,
      setSameAsShipping,
      setShippingMethod,
      setPaymentMethod,
      updateEmail,
      updateNotes,
      applyCoupon,
      removeCoupon,
      calculateTotals,
      placeOrder,
      resetCheckout,
    }),
    [
      checkout,
      isLoading,
      error,
      goToStep,
      goToNextStep,
      goToPreviousStep,
      updateShippingAddress,
      updateBillingAddress,
      setSameAsShipping,
      setShippingMethod,
      setPaymentMethod,
      updateEmail,
      updateNotes,
      applyCoupon,
      removeCoupon,
      calculateTotals,
      placeOrder,
      resetCheckout,
    ],
  )

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

// Custom hook to use the checkout context
export function useCheckout() {
  const context = useContext(CheckoutContext)

  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }

  return context
}
