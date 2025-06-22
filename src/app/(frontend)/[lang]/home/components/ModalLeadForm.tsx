'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFormAnalytics } from '@/hooks/useFormAnalytics'

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
  title,
  description,
  actionType = 'default',
}) => {
  const t = useTranslations('forms.leadForm')
  const tCommon = useTranslations('common')

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', comment: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Аналитика форм
  const formAnalytics = useFormAnalytics({
    formName: 'lead_form',
    formType: actionType
  })

  // Use translations as defaults if not provided
  const modalTitle = title || t('title')
  const modalDescription = description || t('description')

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
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || t('errors.submitError'))
      }

      setSubmitted(true)
      // Трекаем успешную отправку
      formAnalytics.handleFormSubmit(true)
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err instanceof Error ? err.message : t('errors.tryLater'))
      // Трекаем ошибку отправки
      formAnalytics.handleFormSubmit(false)
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
            className="bg-background border border-border rounded-2xl shadow-xl max-w-md w-full p-8 relative"
          >
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl transition-colors"
              onClick={handleClose}
              aria-label={tCommon('close')}
            >
              ×
            </button>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-2xl font-bold mb-2 text-foreground">{modalTitle}</h2>
                <p className="text-muted-foreground mb-4">{modalDescription}</p>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <input
                  name="name"
                  type="text"
                  required
                  placeholder={t('fields.name.placeholder')}
                  className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => formAnalytics.handleFieldFocus('name')}
                />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder={t('fields.phone.placeholder')}
                  className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  value={form.phone}
                  onChange={handleChange}
                />
                <input
                  name="email"
                  type="email"
                  placeholder={t('fields.email.placeholder')}
                  className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  value={form.email}
                  onChange={handleChange}
                />
                <textarea
                  name="comment"
                  placeholder={
                    actionType === 'guarantee'
                      ? t('fields.comment.placeholderGuarantee')
                      : actionType === 'urgent'
                        ? t('fields.comment.placeholderUrgent')
                        : t('fields.comment.placeholder')
                  }
                  className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground min-h-[80px] resize-none"
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
                      {t('buttons.sending')}
                    </div>
                  ) : (
                    t('buttons.submit')
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
                  className="text-2xl font-bold mb-3 text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {t('success.title')}
                </motion.div>

                <motion.div
                  className="text-muted-foreground mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {t('success.description')}
                </motion.div>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <a
                    href="https://t.me/flow_masters_bot?start=lead_form"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {t('success.telegramButton')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>

                  <button
                    className="w-full bg-muted text-muted-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-muted/80"
                    onClick={handleClose}
                  >
                    {t('buttons.close')}
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
