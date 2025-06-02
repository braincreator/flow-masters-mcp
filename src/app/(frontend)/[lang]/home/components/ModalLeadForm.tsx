import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, MessageCircle } from 'lucide-react'

interface ModalLeadFormProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  actionType?: string
}

export const ModalLeadForm: React.FC<ModalLeadFormProps> = ({
  open,
  onClose,
  title = 'Оставьте заявку',
  description = 'Мы свяжемся с вами в ближайшее время',
  actionType = 'default',
}) => {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', comment: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null) // Clear error when user starts typing
  }

  const handleClose = () => {
    // Reset form state when closing
    setSubmitted(false)
    setForm({ name: '', phone: '', email: '', comment: '' })
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formId) {
      setError('Форма не загружена. Попробуйте обновить страницу.')
      setLoading(false)
      return
    }

    try {


      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          actionType,
          source: window.location.href,
          metadata: {
            modalTitle: title,
            modalDescription: description,
            timestamp: new Date().toISOString(),
          }
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Ошибка отправки')
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err instanceof Error ? err.message : 'Ошибка при отправке заявки. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={handleClose}
              aria-label="Закрыть"
            >
              ×
            </button>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">{title}</h2>
                <p className="text-gray-600 mb-4">{description}</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Ваше имя"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.name}
                  onChange={handleChange}
                />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Телефон"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.phone}
                  onChange={handleChange}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.email}
                  onChange={handleChange}
                />
                <textarea
                  name="comment"
                  placeholder={
                    actionType === 'guarantee'
                      ? 'Опишите задачу или желаемый результат'
                      : actionType === 'urgent'
                        ? 'Опишите, почему важно срочно'
                        : 'Комментарий (опционально)'
                  }
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  value={form.comment}
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Отправка...
                    </div>
                  ) : (
                    'Отправить заявку'
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                className="text-center py-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <motion.div
                  className="text-6xl mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200 }}
                >
                  🎉
                </motion.div>

                <motion.div
                  className="text-2xl font-bold mb-3 text-gray-900"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Заявка успешно отправлена!
                </motion.div>

                <motion.div
                  className="text-gray-600 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  Наш менеджер свяжется с вами в ближайшее время для обсуждения деталей проекта.
                </motion.div>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <a
                    href="https://t.me/ai_agency_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Написать в Telegram @ai_agency_bot
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>

                  <button
                    className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-gray-200"
                    onClick={handleClose}
                  >
                    Закрыть
                  </button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
