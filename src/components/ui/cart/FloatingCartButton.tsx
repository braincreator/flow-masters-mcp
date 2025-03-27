'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
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
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragControls = useDragControls()
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Load saved position from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPosition = localStorage.getItem('cartButtonPosition')
        if (savedPosition) {
          setPosition(JSON.parse(savedPosition))
        }
      } catch (error) {
        console.error('Error loading cart button position:', error)
      }
    }
  }, [])

  // Function to start drag with pointer events
  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    dragControls.start(event)
  }

  // Function to handle drag end and save position
  function handleDragEnd(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cartButtonPosition', JSON.stringify(newPosition))
      } catch (error) {
        console.error('Error saving cart button position:', error)
      }
    }

    setPosition(newPosition)
  }

  // Check viewport boundaries on resize
  useEffect(() => {
    function checkBoundaries() {
      if (!containerRef.current) return

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const buttonWidth = containerRef.current.offsetWidth
      const buttonHeight = containerRef.current.offsetHeight

      // Check if button is outside viewport and adjust if needed
      let newX = position.x
      let newY = position.y

      if (position.x < -viewportWidth / 2 + buttonWidth / 2) {
        newX = -viewportWidth / 2 + buttonWidth / 2
      } else if (position.x > viewportWidth / 2 - buttonWidth / 2) {
        newX = viewportWidth / 2 - buttonWidth / 2
      }

      if (position.y < -viewportHeight / 2 + buttonHeight / 2) {
        newY = -viewportHeight / 2 + buttonHeight / 2
      } else if (position.y > viewportHeight / 2 - buttonHeight) {
        newY = viewportHeight / 2 - buttonHeight
      }

      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY })
        localStorage.setItem('cartButtonPosition', JSON.stringify({ x: newX, y: newY }))
      }
    }

    window.addEventListener('resize', checkBoundaries)
    return () => window.removeEventListener('resize', checkBoundaries)
  }, [position])

  // Only show button when there are items in cart
  if (!hasItems) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={containerRef}
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
          className={cn('fixed z-50', className)}
          style={{
            right: '2rem',
            bottom: '2rem',
            touchAction: 'none',
            userSelect: 'none',
          }}
          drag
          dragControls={dragControls}
          onPointerDown={startDrag}
          dragMomentum={false}
          dragTransition={{ timeConstant: 50 }}
          x={position.x}
          y={position.y}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link
            href={`/${locale}/checkout`}
            className="relative group flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg flex items-center justify-center relative hover:bg-primary/90 transition-colors cursor-pointer"
              animate={{ width: isHovered ? 'auto' : 'auto' }}
            >
              <ShoppingCart className="w-6 h-6" />

              {/* Show counter with item count */}
              <span
                className={cn(
                  'absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium shadow-sm border border-background',
                  'bg-amber-500 text-black font-bold',
                )}
              >
                {itemCount}
              </span>
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

          {/* Drag handle hint - appears briefly when cart first shows */}
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
          >
            {locale === 'ru' ? 'Перетащите для перемещения' : 'Drag to move'}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
