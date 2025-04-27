'use client'

import { useContext } from 'react'
import { CheckoutContext } from '@/providers/CheckoutProvider'
import type { 
  CheckoutStep, 
  ShippingMethod, 
  PaymentMethod, 
  Address, 
  CheckoutState 
} from '@/providers/CheckoutProvider'

/**
 * Custom hook to select specific parts of the checkout context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 * 
 * @param selector A function that selects specific parts of the checkout context
 * @returns The selected parts of the checkout context
 */
export function useCheckoutSelector<T>(selector: (context: any) => T): T {
  const context = useContext(CheckoutContext)
  
  if (context === undefined) {
    throw new Error('useCheckoutSelector must be used within a CheckoutProvider')
  }
  
  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the checkout navigation state and methods
 */
export function useCheckoutNavigation() {
  return useCheckoutSelector(context => ({
    currentStep: context.checkout.step,
    goToStep: context.goToStep,
    goToNextStep: context.goToNextStep,
    goToPreviousStep: context.goToPreviousStep,
    isLoading: context.isLoading,
  }))
}

/**
 * Select only the checkout address information
 */
export function useCheckoutAddresses() {
  return useCheckoutSelector(context => ({
    shippingAddress: context.checkout.shippingAddress,
    billingAddress: context.checkout.billingAddress,
    sameAsShipping: context.checkout.sameAsShipping,
    updateShippingAddress: context.updateShippingAddress,
    updateBillingAddress: context.updateBillingAddress,
    setSameAsShipping: context.setSameAsShipping,
    isLoading: context.isLoading,
  }))
}

/**
 * Select only the shipping method information
 */
export function useCheckoutShipping() {
  return useCheckoutSelector(context => ({
    shippingMethod: context.checkout.shippingMethod,
    shippingAmount: context.checkout.shippingAmount,
    setShippingMethod: context.setShippingMethod,
    isLoading: context.isLoading,
  }))
}

/**
 * Select only the payment method information
 */
export function useCheckoutPayment() {
  return useCheckoutSelector(context => ({
    paymentMethod: context.checkout.paymentMethod,
    setPaymentMethod: context.setPaymentMethod,
    isLoading: context.isLoading,
  }))
}

/**
 * Select only the coupon and discount information
 */
export function useCheckoutCoupon() {
  return useCheckoutSelector(context => ({
    couponCode: context.checkout.couponCode,
    discountAmount: context.checkout.discountAmount,
    applyCoupon: context.applyCoupon,
    removeCoupon: context.removeCoupon,
    isLoading: context.isLoading,
  }))
}

/**
 * Select only the checkout totals
 */
export function useCheckoutTotals() {
  return useCheckoutSelector(context => ({
    subtotal: context.checkout.subtotal,
    shippingAmount: context.checkout.shippingAmount,
    taxAmount: context.checkout.taxAmount,
    discountAmount: context.checkout.discountAmount,
    total: context.checkout.total,
    calculateTotals: context.calculateTotals,
  }))
}

/**
 * Select only the order information
 */
export function useCheckoutOrder() {
  return useCheckoutSelector(context => ({
    orderId: context.checkout.orderId,
    orderNumber: context.checkout.orderNumber,
    orderDate: context.checkout.orderDate,
    paymentStatus: context.checkout.paymentStatus,
    orderStatus: context.checkout.orderStatus,
    placeOrder: context.placeOrder,
    resetCheckout: context.resetCheckout,
    isLoading: context.isLoading,
    error: context.error,
  }))
}

/**
 * Select only the customer information
 */
export function useCheckoutCustomer() {
  return useCheckoutSelector(context => ({
    email: context.checkout.email,
    notes: context.checkout.notes,
    updateEmail: context.updateEmail,
    updateNotes: context.updateNotes,
  }))
}
