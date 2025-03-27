'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ModalDialog } from '@/components/ui/modal-dialog'
import { useState } from 'react'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'

interface CartProps {
  locale?: Locale
}

export function Cart({ locale: propLocale }: CartProps) {
  const { items, removeFromCart, updateQuantity, total, locale: cartLocale } = useCart()
  // Используем locale из пропсов, если он передан, иначе используем locale из корзины
  const locale = propLocale || cartLocale
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">
          {locale === 'ru' ? 'Ваша корзина пуста' : 'Your cart is empty'}
        </h2>
        <Button asChild variant="default">
          <Link href={`/${locale}/store`}>
            {locale === 'ru' ? 'Продолжить покупки →' : 'Continue Shopping →'}
          </Link>
        </Button>
      </Card>
    )
  }

  const handleRemove = (productId: string) => {
    setItemToRemove(productId)
    setRemoveModalOpen(true)
  }

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove)
      setRemoveModalOpen(false)
      setItemToRemove(null)
    }
  }

  // Вычисляем общую сумму с учетом локализации цен
  const totalAmount = items.reduce((sum, item) => {
    const price = getLocalePrice(item.product, locale)
    return sum + price * item.quantity
  }, 0)

  const getProductTitle = (product: any) => {
    if (typeof product.title === 'object') {
      return product.title[locale] || product.title.en || 'Product'
    }
    return product.title || 'Product'
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {items.map(({ product, quantity }) => {
          const itemPrice = getLocalePrice(product, locale)

          return (
            <Card key={product.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={
                      typeof product.thumbnail === 'string'
                        ? product.thumbnail
                        : product.thumbnail?.url || ''
                    }
                    alt={getProductTitle(product)}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                <div className="flex-grow">
                  <Link
                    href={`/${locale}/store/${product.slug}`}
                    className="text-lg font-semibold hover:text-primary"
                  >
                    {getProductTitle(product)}
                  </Link>
                  <div className="text-muted-foreground">{formatPrice(itemPrice, locale)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                    className="w-20"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(product.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="sr-only">
                      {locale === 'ru' ? 'Удалить товар' : 'Remove item'}
                    </span>
                  </Button>
                </div>

                <div className="text-lg font-semibold">
                  {formatPrice(itemPrice * quantity, locale)}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>{locale === 'ru' ? 'Итого:' : 'Total:'}</span>
          <span>{formatPrice(totalAmount, locale)}</span>
        </div>

        <Button className="w-full" size="lg" asChild>
          <Link href={`/${locale}/checkout`}>
            {locale === 'ru' ? 'Перейти к оформлению заказа' : 'Proceed to Checkout'}
          </Link>
        </Button>
      </Card>

      <ModalDialog
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title={locale === 'ru' ? 'Удалить товар' : 'Remove Item'}
        description={
          locale === 'ru'
            ? 'Вы уверены, что хотите удалить этот товар из корзины?'
            : 'Are you sure you want to remove this item from your cart?'
        }
        actions={[
          {
            label: locale === 'ru' ? 'Отмена' : 'Cancel',
            onClick: () => setRemoveModalOpen(false),
            variant: 'outline',
          },
          {
            label: locale === 'ru' ? 'Удалить' : 'Remove',
            onClick: confirmRemove,
            variant: 'destructive',
          },
        ]}
      />
    </div>
  )
}
