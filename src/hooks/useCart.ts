'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/payload-types'

interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const MAX_QUANTITY = 99

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product, quantity = 1) => set((state) => {
        if (!product?.id || quantity < 1) return state
        
        const existingItem = state.items.find(
          item => item.product.id === product.id
        )
        
        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + quantity, MAX_QUANTITY)
          return {
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          }
        }
        
        return {
          items: [...state.items, { product, quantity: Math.min(quantity, MAX_QUANTITY) }],
        }
      }),

      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId),
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.min(Math.max(0, quantity), MAX_QUANTITY) }
            : item
        ).filter(item => item.quantity > 0),
      })),

      clearCart: () => set({ items: [] }),

      get total() {
        return get().items.reduce((sum, item) => 
          sum + (item.product.price * item.quantity), 0)
      },

      get itemCount() {
        return get().items.reduce((count, item) => 
          count + item.quantity, 0)
      },
    }),
    {
      name: 'shopping-cart',
      skipHydration: true,
    }
  )
)
