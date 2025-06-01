import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, actionType }),
      })
      if (!res.ok) throw new Error('Ошибка отправки')
      setSubmitted(true)
    } catch (err) {
      alert('Ошибка при отправке заявки. Попробуйте позже.')
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
              onClick={onClose}
              aria-label="Закрыть"
            >
              ×
            </button>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">{title}</h2>
                <p className="text-gray-600 mb-4">{description}</p>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="text-3xl mb-4">🎉</div>
                <div className="text-xl font-bold mb-2">Спасибо за заявку!</div>
                <div className="text-gray-600 mb-6">Мы свяжемся с вами в ближайшее время.</div>
                <button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg"
                  onClick={onClose}
                >
                  Закрыть
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
