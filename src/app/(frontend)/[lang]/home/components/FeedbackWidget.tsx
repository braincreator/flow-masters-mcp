'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Star, Send, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAnalytics } from '@/providers/AnalyticsProvider'
import { cn } from '@/lib/utils'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface FeedbackData {
  type: 'rating' | 'suggestion' | 'bug' | 'general'
  rating?: number
  message: string
  email?: string
  page: string
  timestamp: number
  userAgent: string
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'trigger' | 'type' | 'rating' | 'message' | 'success'>('trigger')
  const [feedbackType, setFeedbackType] = useState<FeedbackData['type']>('general')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { trackEvent } = useAnalytics()

  // Auto-show feedback widget after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenFeedback = localStorage.getItem('feedback_widget_seen')
      if (!hasSeenFeedback) {
        setIsOpen(true)
        localStorage.setItem('feedback_widget_seen', 'true')
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const feedbackData: FeedbackData = {
      type: feedbackType,
      rating: feedbackType === 'rating' ? rating : undefined,
      message,
      email: email || undefined,
      page: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    }

    try {
      // Store locally
      const existingFeedback = JSON.parse(localStorage.getItem('user_feedback') || '[]')
      existingFeedback.push(feedbackData)
      localStorage.setItem('user_feedback', JSON.stringify(existingFeedback))

      // Track in analytics
      trackEvent('user_experience', 'feedback_submitted', feedbackType, rating)

      // Here you would send to your API
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData)
      // })

      setStep('success')
    } catch (error) {
      logError('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetWidget = () => {
    setStep('trigger')
    setFeedbackType('general')
    setRating(0)
    setMessage('')
    setEmail('')
    setIsOpen(false)
  }

  if (!isOpen && step === 'trigger') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true)
            setStep('type')
            trackEvent('user_experience', 'feedback_widget_opened', 'manual_open')
          }}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold">Обратная связь</h3>
            <button
              onClick={resetWidget}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {/* Step 1: Choose feedback type */}
            {step === 'type' && (
              <div className="space-y-4">
                <p className="text-gray-700">Что вас интересует?</p>
                <div className="space-y-2">
                  {[
                    { type: 'rating' as const, label: 'Оценить страницу', icon: '⭐' },
                    { type: 'suggestion' as const, label: 'Предложение', icon: '💡' },
                    { type: 'bug' as const, label: 'Сообщить об ошибке', icon: '🐛' },
                    { type: 'general' as const, label: 'Общий вопрос', icon: '💬' },
                  ].map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFeedbackType(type)
                        setStep(type === 'rating' ? 'rating' : 'message')
                      }}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <span className="mr-3">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Rating */}
            {step === 'rating' && (
              <div className="space-y-4">
                <p className="text-gray-700">Как вам наша страница?</p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={cn(
                        'p-1 transition-colors',
                        star <= rating ? 'text-yellow-400' : 'text-gray-300',
                      )}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setStep('message')}
                    disabled={rating === 0}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Продолжить
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Message */}
            {step === 'message' && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  {feedbackType === 'rating' && 'Расскажите подробнее:'}
                  {feedbackType === 'suggestion' && 'Ваше предложение:'}
                  {feedbackType === 'bug' && 'Опишите проблему:'}
                  {feedbackType === 'general' && 'Ваш вопрос:'}
                </p>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите ваше сообщение..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email для ответа (необязательно)"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex space-x-2">
                  <button
                    onClick={() => setStep(feedbackType === 'rating' ? 'rating' : 'type')}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="text-green-600 text-4xl">✅</div>
                <p className="text-gray-700">Спасибо за обратную связь!</p>
                <p className="text-sm text-gray-500">
                  Мы ценим ваше мнение и обязательно его учтем.
                </p>
                <button
                  onClick={resetWidget}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Quick feedback buttons for specific sections
export function QuickFeedback({ section }: { section: string }) {
  const { trackEvent } = useAnalytics()
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type)
    trackEvent('user_experience', 'quick_feedback', `${section}_${type}`)

    // Store feedback
    const quickFeedback = JSON.parse(localStorage.getItem('quick_feedback') || '[]')
    quickFeedback.push({
      section,
      type,
      timestamp: Date.now(),
    })
    localStorage.setItem('quick_feedback', JSON.stringify(quickFeedback))
  }

  if (feedback) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center text-green-600 text-sm"
      >
        Спасибо за отзыв! 👍
      </motion.div>
    )
  }

  return (
    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
      <span>Полезно?</span>
      <button
        onClick={() => handleFeedback('positive')}
        className="flex items-center space-x-1 hover:text-green-600 transition-colors"
      >
        <ThumbsUp className="w-4 h-4" />
        <span>Да</span>
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        className="flex items-center space-x-1 hover:text-red-600 transition-colors"
      >
        <ThumbsDown className="w-4 h-4" />
        <span>Нет</span>
      </button>
    </div>
  )
}
