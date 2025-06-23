'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, MessageCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadFormSchema, type LeadFormData } from '@/types/forms'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useFormAnalytics } from '@/hooks/useFormAnalytics'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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
  const { toast } = useToast()

  // Use translations as defaults if not provided
  const modalTitle = title || t('title')
  const modalDescription = description || t('description')

  // Аналитика форм
  const formAnalytics = useFormAnalytics({
    formName: 'lead_form',
    formType: actionType,
    trackFieldFocus: true,
    trackFieldBlur: true,
    trackFieldErrors: true,
  })

  // React Hook Form с Zod валидацией
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      comment: '',
    },
  })

  const handleClose = () => {
    // Reset form state when closing
    reset()
    onClose()
  }

  const onSubmit: SubmitHandler<LeadFormData> = async (data) => {
    try {
      // Трекаем начало отправки
      formAnalytics.handleFormSubmit(true)

      // Подготавливаем данные для отправки
      const formData = {
        ...data,
        actionType,
        source: window.location.href,
        metadata: {
          modalTitle: title,
          modalDescription: description,
          timestamp: new Date().toISOString(),
        },
      }

      // Отправляем форму
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка отправки формы')
      }

      // Успешная отправка
      toast({
        title: t('success.title'),
        description: t('success.description'),
      })

      logDebug('Lead form submitted successfully')

    } catch (error) {
      logError('Form submission error:', error)

      // Трекаем ошибку отправки
      formAnalytics.handleFormSubmit(false)

      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при отправке',
        variant: 'destructive',
      })
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
            {!isSubmitSuccessful ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h2 className="text-2xl font-bold mb-2 text-foreground">{modalTitle}</h2>
                <p className="text-muted-foreground mb-4">{modalDescription}</p>

                {/* Name Field */}
                <div>
                  <Input
                    placeholder={t('fields.name.placeholder')}
                    {...register('name')}
                    className={errors.name ? 'border-destructive' : ''}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    onFocus={() => formAnalytics.handleFieldFocus('name')}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <Input
                    type="tel"
                    placeholder={t('fields.phone.placeholder')}
                    {...register('phone')}
                    className={errors.phone ? 'border-destructive' : ''}
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    onFocus={() => formAnalytics.handleFieldFocus('phone')}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <Input
                    type="email"
                    placeholder={t('fields.email.placeholder')}
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    onFocus={() => formAnalytics.handleFieldFocus('email')}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Comment Field */}
                <div>
                  <Textarea
                    placeholder={
                      actionType === 'guarantee'
                        ? t('fields.comment.placeholderGuarantee')
                        : actionType === 'urgent'
                          ? t('fields.comment.placeholderUrgent')
                          : t('fields.comment.placeholder')
                    }
                    {...register('comment')}
                    className="min-h-[80px] resize-none"
                    onFocus={() => formAnalytics.handleFieldFocus('comment')}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('buttons.sending')}
                    </>
                  ) : (
                    t('buttons.submit')
                  )}
                </Button>
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
