'use client'

import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
// import { ModalDialog } from '@/components/ui/modal-dialog' // Bypassing for diagnostics
import { Cart } from '@/components/Cart'
import { useTranslations } from 'next-intl'
import { Locale } from '@/constants'
import { cn } from '@/utilities/ui'

interface CartModalProps {
  locale: Locale
}

export function CartModal({ locale }: CartModalProps) {
  const { isCartModalOpen, closeCartModal } = useCart()
  const t = useTranslations('Cart') // Assuming 'Cart' namespace has a 'title'

  if (!isCartModalOpen) {
    return null
  }

  return (
    <DialogPrimitive.Root open={isCartModalOpen} onOpenChange={closeCartModal}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-black/80 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
            'gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', // These are from the original modal.tsx
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            // Removed aggressive diagnostic styles, relying on the fix in modal.tsx
          )}
          // Removed inline style
        >
          <DialogPrimitive.Title className="text-lg font-semibold">
            {t('title')}
          </DialogPrimitive.Title>
          <Cart locale={locale} />
          {/* Removed yellow test box */}
          <DialogPrimitive.Close
            className={cn(
              'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity',
              'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}