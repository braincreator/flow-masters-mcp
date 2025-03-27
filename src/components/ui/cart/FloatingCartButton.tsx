'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/providers/CartProvider'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utilities/ui'
import { Locale } from '@/constants'

interface FloatingCartButtonProps {
  locale: Locale
  className?: string
}

export default function FloatingCartButton({ locale, className }: FloatingCartButtonProps) {
  const { items, itemCount } = useCart()
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hasItems, setHasItems] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && visible && currentScrollY > 100) {
        setVisible(false)
      } else if (currentScrollY < lastScrollY && !visible) {
        setVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, visible])

  // Check if there are items in cart and trigger animation when items are added
  useEffect(() => {
    const newHasItems = items.length > 0

    if (!hasItems && newHasItems) {
      // Item was just added
      setAnimate(true)
      setTimeout(() => setAnimate(false), 800)
    }

    setHasItems(newHasItems)
  }, [items, hasItems])

  if (!hasItems) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: animate ? [1, 1.2, 1] : 1,
          }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            duration: 0.3,
            scale: { duration: 0.4 },
          }}
          className={cn('fixed bottom-8 right-8 z-50', className)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link href={`/${locale}/checkout`} className="relative group flex items-center">
            <motion.div
              className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg flex items-center justify-center relative hover:bg-primary/90 transition-colors"
              animate={{ width: isHovered ? 'auto' : 'auto' }}
            >
              <ShoppingCart className="w-6 h-6" />

              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                  {itemCount}
                </span>
              )}
            </motion.div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-[calc(100%+8px)] whitespace-nowrap bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-md flex items-center gap-2"
                >
                  <span className="font-medium">
                    {locale === 'ru' ? 'Оформить заказ' : 'Checkout'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
