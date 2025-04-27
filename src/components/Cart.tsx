'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/providers/CartProvider'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ModalDialog } from '@/components/ui/modal-dialog'
import { useState } from 'react'
import { formatPrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'
import { Product } from '@/payload-types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'

interface CartProps {
  locale: Locale
}

export function Cart({ locale }: CartProps) {
  const t = useTranslations('Cart')
  const {
    cart,
    itemCount,
    total,
    isLoading,
    error,
    removeItem,
    updateItem,
    emptyCart,
    refreshCart,
  } = useCart()

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  if (isLoading) {
    return <CartSkeleton />
  }

  if (error) {
    return (
      <Card className="text-center py-12 text-destructive">
        <h2 className="text-2xl font-bold mb-4">{t('errorTitle')}</h2>
        <p>{error.message || t('errorDescriptionDefault')}</p>
        <Button onClick={() => refreshCart()} variant="outline" className="mt-4">
          {t('tryAgainButton')}
        </Button>
      </Card>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('emptyTitle')}</h2>
        <Button asChild variant="default">
          <Link href={`/${locale}/products`}>{t('continueShoppingButton')}</Link>
        </Button>
      </Card>
    )
  }

  const handleRemoveClick = (productId: string) => {
    setItemToRemove(productId)
    setRemoveModalOpen(true)
  }

  const confirmRemove = async () => {
    if (!itemToRemove) return
    setUpdatingItemId(itemToRemove)
    setRemoveModalOpen(false)
    try {
      await removeItem(itemToRemove)
    } finally {
      setItemToRemove(null)
      setUpdatingItemId(null)
    }
  }

  const handleQuantityChange = async (productId: string, newQuantityStr: string) => {
    const newQuantity = parseInt(newQuantityStr, 10)
    if (isNaN(newQuantity) || newQuantity < 0) return

    setUpdatingItemId(productId)
    try {
      if (newQuantity === 0) {
        await removeItem(productId)
      } else {
        await updateItem(productId, newQuantity)
      }
    } finally {
      setUpdatingItemId(null)
    }
  }

  const getProductTitle = (itemProduct: string | Product | null | undefined): string => {
    if (typeof itemProduct === 'object' && itemProduct?.title) {
      const title = itemProduct.title
      return typeof title === 'object'
        ? title[locale] || title.en || t('productFallbackTitle')
        : title
    }
    return t('productFallbackTitle')
  }

  const getProductSlug = (itemProduct: string | Product | null | undefined): string | null => {
    if (typeof itemProduct === 'object' && itemProduct?.slug) {
      return typeof itemProduct.slug === 'string' ? itemProduct.slug : itemProduct.slug[0] || null
    }
    return null
  }

  const getProductImageUrl = (itemProduct: string | Product | null | undefined): string => {
    if (typeof itemProduct === 'object' && itemProduct?.thumbnail) {
      const thumbnail = itemProduct.thumbnail
      return typeof thumbnail === 'object' ? thumbnail.url || '' : thumbnail || ''
    }
    return ''
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {cart.items.map(({ product, quantity, price }) => {
          const productId = typeof product === 'string' ? product : product?.id
          if (!productId) return null

          const title = getProductTitle(product)
          const slug = getProductSlug(product)
          const imageUrl = getProductImageUrl(product)
          const isUpdating = updatingItemId === productId

          return (
            <Card
              key={productId}
              className={cn(
                'p-4 transition-opacity',
                isUpdating && 'opacity-50 pointer-events-none',
              )}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, 96px"
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <Skeleton className="w-full h-full rounded-md" />
                  )}
                </div>

                <div className="flex-grow">
                  {slug ? (
                    <Link
                      href={`/${locale}/products/${slug}`}
                      className="text-lg font-semibold hover:text-primary"
                    >
                      {title}
                    </Link>
                  ) : (
                    <span className="text-lg font-semibold">{title}</span>
                  )}
                  <div className="text-muted-foreground">{formatPrice(price, locale)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(productId, e.target.value)}
                    className="w-20"
                    disabled={isUpdating}
                    aria-label={t('quantityLabel')}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveClick(productId)}
                    className="text-destructive hover:text-destructive/90"
                    disabled={isUpdating}
                    aria-label={t('removeItemLabel')}
                  >
                    {isUpdating && updatingItemId === productId ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                <div className="text-lg font-semibold ml-auto sm:ml-0">
                  {formatPrice(price * quantity, locale)}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>{t('totalLabel')}</span>
          <span>{formatPrice(total, locale)}</span>
        </div>

        <Button className="w-full" size="lg" asChild>
          <Link href={`/${locale}/checkout`}>{t('checkoutButton')}</Link>
        </Button>
      </Card>

      <ModalDialog
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title={t('removeModalTitle')}
        description={t('removeModalDescription')}
        actions={[
          {
            label: t('cancelButton'),
            onClick: () => setRemoveModalOpen(false),
            variant: 'outline',
          },
          {
            label: t('removeButton'),
            onClick: confirmRemove,
            variant: 'destructive',
          },
        ]}
      />
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-24 rounded-md" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-20 h-10" />
                <Skeleton className="w-10 h-10 rounded-md" />
              </div>
              <Skeleton className="h-6 w-1/5" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-7 w-1/4" />
          <Skeleton className="h-7 w-1/5" />
        </div>
        <Skeleton className="h-12 w-full" />
      </Card>
    </div>
  )
}
