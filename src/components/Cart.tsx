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

export function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart()
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button asChild variant="default">
          <Link href="/store">
            Continue Shopping →
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

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {items.map(({ product, quantity }) => (
          <Card key={product.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={product.thumbnail.url}
                  alt={product.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              <div className="flex-grow">
                <Link 
                  href={`/store/${product.slug}`}
                  className="text-lg font-semibold hover:text-primary"
                >
                  {product.title}
                </Link>
                <div className="text-muted-foreground">${product.price}</div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => 
                    updateQuantity(product.id, parseInt(e.target.value))
                  }
                  className="w-20"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(product.id)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>

              <div className="text-lg font-semibold">
                ${(product.price * quantity).toFixed(2)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <Button className="w-full" size="lg" asChild>
          <Link href="/checkout">
            Proceed to Checkout
          </Link>
        </Button>
      </Card>

      <ModalDialog
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Remove Item"
        description="Are you sure you want to remove this item from your cart?"
        actions={[
          {
            label: "Cancel",
            onClick: () => setRemoveModalOpen(false),
            variant: "outline"
          },
          {
            label: "Remove",
            onClick: confirmRemove,
            variant: "destructive"
          }
        ]}
      />
    </div>
  )
}
