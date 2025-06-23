'use client'

import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/providers/CartProvider'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Locale } from '@/constants'
import { Skeleton } from '@/components/ui/skeleton'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface FloatingCartButtonProps {
  locale: Locale
  className?: string
}

export default function FloatingCartButton({ locale, className }: FloatingCartButtonProps) {
  const { items = [], itemCount = 0, isLoading, error, toggleCartModal } = useCart(locale)
  const t = useTranslations('FloatingCartButton')
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const prevItemCountRef = useRef(itemCount)

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
        logError('Error loading cart button position:', error)
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

  // Отслеживаем изменение itemCount для анимации
  useEffect(() => {
    if (!isLoading && itemCount > prevItemCountRef.current) {
      // Item was just added
      setAnimate(true)
      setTimeout(() => setAnimate(false), 800)
    }
    // Обновляем предыдущее значение после проверки
    prevItemCountRef.current = itemCount
  }, [itemCount, isLoading])

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
            logError('Error saving cart button position:', error)
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
    if (!e.touches || e.touches.length === 0) return
    const touch = e.touches[0]
    if (!touch) return // Add null check for touch

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
    if (!isDragging || !e.touches || e.touches.length === 0) return

    const touch = e.touches[0]
    if (!touch) return // Add null check for touch
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
          logError('Error saving cart button position:', error)
        }
      }
    }
  }

  // Скрываем кнопку, если идет загрузка, есть ошибка или нет товаров
  if (isLoading || error || itemCount <= 0) return null

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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: animate ? [1, 1.2, 1] : isHovered ? 1.05 : 1,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'rounded-full bg-accent shadow-xl relative',
              isHovered && 'shadow-accent/50 shadow-2xl',
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                // Проверяем, было ли реальное перетаскивание
                if (wasRecentlyDragged(e)) {
                  e.preventDefault()
                  e.stopPropagation()
                  return false
                }
                // В противном случае разрешаем клик и открываем модалку
                toggleCartModal()
              }}
              className="p-4 flex items-center justify-center cursor-pointer relative block w-full h-full appearance-none bg-transparent border-none"
              aria-label={t('viewCart')}
            >
              <ShoppingCart className="w-6 h-6 text-accent-foreground" />

              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-2 whitespace-nowrap overflow-hidden text-accent-foreground"
                  >
                    {t('viewCart')}
                  </motion.span>
                )}
              </AnimatePresence>

              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={cn(
                    'absolute -top-2 -right-2 bg-amber-500 text-black font-bold',
                    'rounded-full min-w-5 h-5 flex items-center justify-center text-xs',
                    'px-1 shadow-sm border border-background',
                  )}
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
