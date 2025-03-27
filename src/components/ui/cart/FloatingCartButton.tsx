'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart } from 'lucide-react'
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

  // Refs and state for manual drag
  const buttonRef = useRef<HTMLDivElement>(null)
  const lastDragTimeRef = useRef<number>(0)
  const dragDistanceRef = useRef<number>(0)
  const [isDragging, setIsDragging] = useState(false)
  const [wasDragged, setWasDragged] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const dragThreshold = 5 // Повышенное пороговое значение для определения перетаскивания

  // Load saved position from localStorage on first render
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

  // Reset wasDragged flag after some delay
  useEffect(() => {
    if (wasDragged) {
      const timer = setTimeout(() => {
        setWasDragged(false)
      }, 300) // Уменьшаем задержку

      return () => clearTimeout(timer)
    }
  }, [wasDragged])

  // Manual drag handlers
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isDragging) return

      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      // Вычисляем пройденное расстояние при перетаскивании
      dragDistanceRef.current += Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Проверяем, было ли существенное перемещение
      if (dragDistanceRef.current > dragThreshold) {
        setWasDragged(true)
      }

      setPosition((prevPos) => ({
        x: prevPos.x + deltaX,
        y: prevPos.y + deltaY,
      }))

      setDragStart({
        x: e.clientX,
        y: e.clientY,
      })
    }

    function handleMouseUp(e: MouseEvent) {
      if (isDragging) {
        setIsDragging(false)
        // Записываем время последнего перетаскивания только если было реальное перетаскивание
        if (dragDistanceRef.current > dragThreshold) {
          lastDragTimeRef.current = e.timeStamp
        }

        // Save position to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cartButtonPosition', JSON.stringify(position))
          } catch (error) {
            console.error('Error saving cart button position:', error)
          }
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, position, dragThreshold])

  function handleMouseDown(e: React.MouseEvent) {
    // Only initiate drag with left mouse button
    if (e.button !== 0) return

    // Сбрасываем счетчик расстояния при начале новой операции перетаскивания
    dragDistanceRef.current = 0

    e.preventDefault()

    // НЕ устанавливаем wasDragged сразу, а только после фактического перетаскивания
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
  }

  // Touch events for mobile
  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]

    // Сбрасываем счетчик расстояния при начале новой операции перетаскивания
    dragDistanceRef.current = 0

    // НЕ устанавливаем wasDragged сразу, а только после фактического перетаскивания
    setIsDragging(true)
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
    })
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y

    // Вычисляем пройденное расстояние при перетаскивании
    dragDistanceRef.current += Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Проверяем, было ли существенное перемещение
    if (dragDistanceRef.current > dragThreshold) {
      setWasDragged(true)
    }

    setPosition((prevPos) => ({
      x: prevPos.x + deltaX,
      y: prevPos.y + deltaY,
    }))

    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
    })
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (isDragging) {
      setIsDragging(false)
      // Записываем время последнего перетаскивания только если было реальное перетаскивание
      if (dragDistanceRef.current > dragThreshold) {
        lastDragTimeRef.current = e.timeStamp
      }

      // Save position to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('cartButtonPosition', JSON.stringify(position))
        } catch (error) {
          console.error('Error saving cart button position:', error)
        }
      }
    }
  }

  // Only show button when there are items in cart
  if (!hasItems) return null

  // Функция для проверки недавнего перетаскивания
  const wasRecentlyDragged = (e: React.MouseEvent) => {
    // Предотвращать клики только если:
    // 1. В данный момент происходит перетаскивание И пройденное расстояние больше порога
    // 2. Флаг wasDragged установлен (т.е. было реальное перетаскивание)
    // 3. Прошло менее 300мс после окончания перетаскивания с distance > threshold
    return (
      (isDragging && dragDistanceRef.current > dragThreshold) ||
      wasDragged ||
      (e.timeStamp - lastDragTimeRef.current < 300 && lastDragTimeRef.current > 0)
    )
  }

  return (
    <AnimatePresence>
      {visible && (
        <div
          ref={buttonRef}
          className={cn(
            'fixed z-50 select-none',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
            className,
          )}
          style={{
            bottom: '2rem',
            right: '2rem',
            transform: `translate(${position.x}px, ${position.y}px)`,
            userSelect: 'none',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: animate ? [1, 1.2, 1] : 1,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="rounded-full bg-accent shadow-xl relative"
          >
            <Link
              href={`/${locale}/checkout`}
              onClick={(e) => {
                // Проверяем, было ли реальное перетаскивание
                if (wasRecentlyDragged(e)) {
                  e.preventDefault()
                  e.stopPropagation()
                  return false
                }
                // В противном случае разрешаем клик
              }}
              className="p-4 flex items-center justify-center cursor-pointer relative block"
            >
              <ShoppingCart className="w-6 h-6 text-accent-foreground" />

              <span className="absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium shadow-sm border border-background bg-amber-500 text-black font-bold">
                {itemCount}
              </span>
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
