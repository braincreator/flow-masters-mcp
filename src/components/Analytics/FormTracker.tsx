'use client'

import { useEffect } from 'react'
import { usePixelEvents } from '@/hooks/usePixelEvents'

interface FormTrackerProps {
  formId?: string
  formName?: string
  conversionValue?: number
  conversionType?: 'lead' | 'contact' | 'registration'
}

/**
 * Компонент для автоматического отслеживания отправки форм
 * Добавляется на страницы с формами для отслеживания конверсий
 */
export default function FormTracker({ 
  formId, 
  formName = 'Contact Form',
  conversionValue = 0,
  conversionType = 'lead'
}: FormTrackerProps) {
  const { trackEvent } = usePixelEvents()

  useEffect(() => {
    const handleFormSubmit = async (event: Event) => {
      const form = event.target as HTMLFormElement
      
      // Проверяем, что это нужная форма
      if (formId && form.id !== formId) return
      
      // Небольшая задержка для обработки формы
      setTimeout(async () => {
        await trackEvent('form_submit', {
          form_name: formName,
          form_id: formId || form.id || 'unknown',
          value: conversionValue,
          currency: 'RUB',
          content_name: formName,
        })

        // Отслеживаем конверсию
        if (conversionType === 'lead') {
          await trackEvent('lead', {
            value: conversionValue,
            currency: 'RUB',
            content_name: formName,
          })
        } else if (conversionType === 'contact') {
          await trackEvent('contact', {
            content_name: formName,
          })
        } else if (conversionType === 'registration') {
          await trackEvent('registration', {
            method: 'form',
            content_name: formName,
          })
        }
      }, 100)
    }

    // Добавляем обработчик для всех форм или конкретной формы
    if (formId) {
      const form = document.getElementById(formId)
      if (form) {
        form.addEventListener('submit', handleFormSubmit)
        return () => form.removeEventListener('submit', handleFormSubmit)
      }
    } else {
      // Отслеживаем все формы на странице
      document.addEventListener('submit', handleFormSubmit)
      return () => document.removeEventListener('submit', handleFormSubmit)
    }
  }, [formId, formName, conversionValue, conversionType, trackEvent])

  return null // Компонент невидимый
}

/**
 * HOC для автоматического добавления отслеживания к формам
 */
export function withFormTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  trackerProps: FormTrackerProps
) {
  return function TrackedFormComponent(props: T) {
    return (
      <>
        <WrappedComponent {...props} />
        <FormTracker {...trackerProps} />
      </>
    )
  }
}

/**
 * Хук для ручного отслеживания отправки формы
 */
export function useFormTracking() {
  const { trackEvent } = usePixelEvents()

  const trackFormSubmit = async (formData: {
    formName: string
    formId?: string
    conversionValue?: number
    conversionType?: 'lead' | 'contact' | 'registration'
    additionalData?: Record<string, any>
  }) => {
    const {
      formName,
      formId,
      conversionValue = 0,
      conversionType = 'lead',
      additionalData = {}
    } = formData

    // Отслеживаем отправку формы
    await trackEvent('form_submit', {
      form_name: formName,
      form_id: formId || 'unknown',
      value: conversionValue,
      currency: 'RUB',
      content_name: formName,
      ...additionalData,
    })

    // Отслеживаем конверсию
    if (conversionType === 'lead') {
      await trackEvent('lead', {
        value: conversionValue,
        currency: 'RUB',
        content_name: formName,
        ...additionalData,
      })
    } else if (conversionType === 'contact') {
      await trackEvent('contact', {
        content_name: formName,
        ...additionalData,
      })
    } else if (conversionType === 'registration') {
      await trackEvent('registration', {
        method: 'form',
        content_name: formName,
        ...additionalData,
      })
    }
  }

  return { trackFormSubmit }
}
