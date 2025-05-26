'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Users, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialProofEvent {
  id: string
  type: 'signup' | 'purchase' | 'consultation' | 'download'
  message: string
  location?: string
  timeAgo: string
  avatar?: string
  name?: string
}

const mockEvents: SocialProofEvent[] = [
  {
    id: '1',
    type: 'consultation',
    message: 'заказал консультацию по внедрению ИИ',
    location: 'Москва',
    timeAgo: '2 минуты назад',
    name: 'Алексей П.'
  },
  {
    id: '2',
    type: 'download',
    message: 'скачал гайд по автоматизации бизнеса',
    location: 'Санкт-Петербург',
    timeAgo: '5 минут назад',
    name: 'Мария С.'
  },
  {
    id: '3',
    type: 'signup',
    message: 'подписался на рассылку об ИИ-трендах',
    location: 'Екатеринбург',
    timeAgo: '8 минут назад',
    name: 'Дмитрий К.'
  },
  {
    id: '4',
    type: 'purchase',
    message: 'заказал разработку чат-бота',
    location: 'Новосибирск',
    timeAgo: '12 минут назад',
    name: 'Елена В.'
  },
  {
    id: '5',
    type: 'consultation',
    message: 'записался на бесплатный аудит',
    location: 'Казань',
    timeAgo: '15 минут назад',
    name: 'Игорь Р.'
  },
  {
    id: '6',
    type: 'purchase',
    message: 'заказал ИИ-агента для продаж',
    location: 'Ростов-на-Дону',
    timeAgo: '18 минут назад',
    name: 'Анна Л.'
  }
]

const eventIcons = {
  signup: Users,
  purchase: CheckCircle,
  consultation: TrendingUp,
  download: Clock
}

const eventColors = {
  signup: 'bg-blue-500',
  purchase: 'bg-green-500',
  consultation: 'bg-purple-500',
  download: 'bg-orange-500'
}

export function SocialProofNotifications() {
  const [currentEvent, setCurrentEvent] = useState<SocialProofEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [eventIndex, setEventIndex] = useState(0)

  useEffect(() => {
    const showNotification = () => {
      const event = mockEvents[eventIndex]
      setCurrentEvent(event)
      setIsVisible(true)

      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 4000)

      // Move to next event
      setEventIndex((prev) => (prev + 1) % mockEvents.length)
    }

    // Show first notification after 10 seconds
    const initialTimer = setTimeout(showNotification, 10000)

    // Then show every 15 seconds
    const interval = setInterval(showNotification, 15000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [eventIndex])

  return (
    <AnimatePresence>
      {isVisible && currentEvent && (
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.8 }}
          className="fixed bottom-6 left-6 z-40 max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                eventColors[currentEvent.type]
              )}>
                {React.createElement(eventIcons[currentEvent.type], {
                  className: "w-5 h-5 text-white"
                })}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {currentEvent.name}
                  </span>
                  {currentEvent.location && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {currentEvent.location}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-2">
                  {currentEvent.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {currentEvent.timeAgo}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">
                      Онлайн
                    </span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Live counter component
export function LiveStatsCounter() {
  const [stats, setStats] = useState({
    activeUsers: 47,
    consultationsToday: 12,
    projectsCompleted: 156
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        consultationsToday: prev.consultationsToday + (Math.random() > 0.7 ? 1 : 0),
        projectsCompleted: prev.projectsCompleted + (Math.random() > 0.9 ? 1 : 0)
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">
        🔥 Прямо сейчас
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white/80">Активных посетителей:</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white font-bold">{stats.activeUsers}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white/80">Консультаций сегодня:</span>
          <span className="text-yellow-400 font-bold">{stats.consultationsToday}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white/80">Проектов завершено:</span>
          <span className="text-blue-400 font-bold">{stats.projectsCompleted}</span>
        </div>
      </div>
    </div>
  )
}

// Testimonial ticker
export function TestimonialTicker() {
  const testimonials = [
    "«ИИ увеличил наши продажи на 73% за месяц» — Алексей П., ТехноМаркет",
    "«Сэкономили 120 часов в месяц на рутине» — Мария С., МедКлиника",
    "«ROI 1200% за первые 3 недели» — Дмитрий К., СтройГрупп",
    "«Лучшее решение для автоматизации» — Елена В., Ритейл Про",
    "«Клиенты в восторге от скорости ответов» — Игорь Р., Консалт+"
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
      <div className="text-center">
        <h4 className="font-semibold text-gray-900 mb-4">💬 Что говорят клиенты</h4>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-gray-700 italic text-sm leading-relaxed"
          >
            {testimonials[currentIndex]}
          </motion.p>
        </AnimatePresence>
        
        <div className="flex justify-center space-x-2 mt-4">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-300",
                index === currentIndex ? "bg-blue-600" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
