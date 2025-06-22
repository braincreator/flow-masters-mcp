'use client'

import { useCallback, useRef } from 'react'
import { useAnalytics } from '@/providers/AnalyticsProvider'

interface FormAnalyticsOptions {
  formName: string
  formType?: string
  trackFieldFocus?: boolean
  trackFieldBlur?: boolean
  trackFieldErrors?: boolean
}

export function useFormAnalytics(options: FormAnalyticsOptions) {
  const analytics = useAnalytics()
  const formStartedRef = useRef(false)
  const fieldsInteractedRef = useRef<Set<string>>(new Set())

  const { formName, formType, trackFieldFocus = true, trackFieldBlur = false, trackFieldErrors = true } = options

  // Трекинг начала заполнения формы
  const handleFormStart = useCallback(() => {
    if (!formStartedRef.current) {
      analytics.trackEvent('interaction', 'form_start', formName, undefined, {
        form_type: formType,
      })
      formStartedRef.current = true
    }
  }, [formName, formType, analytics])

  // Трекинг отправки формы
  const handleFormSubmit = useCallback((success: boolean = true) => {
    const eventName = success ? 'form_submit_success' : 'form_submit_error'
    analytics.trackEvent('interaction', eventName, formName, undefined, {
      form_type: formType,
      success,
    })
  }, [formName, formType, analytics])

  // Трекинг фокуса на поле
  const handleFieldFocus = useCallback((fieldName: string) => {
    if (trackFieldFocus) {
      // Трекаем начало формы при первом фокусе
      handleFormStart()
      
      // Трекаем фокус на поле (только первый раз)
      if (!fieldsInteractedRef.current.has(fieldName)) {
        analytics.trackEvent('interaction', 'form_field_focus', fieldName, undefined, {
          form_name: formName,
          form_type: formType,
        })
        fieldsInteractedRef.current.add(fieldName)
      }
    }
  }, [formName, formType, trackFieldFocus, analytics, handleFormStart])

  // Трекинг ошибок валидации
  const handleFieldError = useCallback((fieldName: string, errorMessage: string) => {
    if (trackFieldErrors && typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        window.ym(parseInt(metrikaId), 'reachGoal', 'form_field_error', {
          form_name: formName,
          field_name: fieldName,
          error_message: errorMessage
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Form field error tracked:', { formName, fieldName, errorMessage })
    }
  }, [formName, trackFieldErrors])

  // Создание обработчиков для полей формы
  const createFieldHandlers = useCallback((fieldName: string) => ({
    onFocus: () => handleFieldFocus(fieldName),
    onBlur: trackFieldBlur ? () => {
      // Дополнительная логика для blur если нужна
    } : undefined,
  }), [handleFieldFocus, trackFieldBlur])

  // Обработчик для react-hook-form
  const createRHFHandlers = useCallback(() => ({
    onSubmit: (data: any) => {
      handleFormSubmit(true)
      return data
    },
    onError: (errors: any) => {
      handleFormSubmit(false)
      
      // Трекаем каждую ошибку валидации
      Object.entries(errors).forEach(([fieldName, error]: [string, any]) => {
        if (error?.message) {
          handleFieldError(fieldName, error.message)
        }
      })
    }
  }), [handleFormSubmit, handleFieldError])

  return {
    // Основные методы
    handleFormStart,
    handleFormSubmit,
    handleFieldFocus,
    handleFieldError,
    
    // Утилиты
    createFieldHandlers,
    createRHFHandlers,
    
    // Состояние
    isFormStarted: formStartedRef.current,
    interactedFields: Array.from(fieldsInteractedRef.current)
  }
}

// Хук для автоматического трекинга форм с помощью ref
export function useAutoFormTracking(formName: string, formType?: string) {
  const analytics = useFormAnalytics({ formName, formType })
  
  const formRef = useCallback((node: HTMLFormElement | null) => {
    if (node) {
      // Автоматически добавляем обработчики к полям формы
      const inputs = node.querySelectorAll('input, textarea, select')
      
      inputs.forEach((input) => {
        const fieldName = input.getAttribute('name') || input.getAttribute('id') || 'unknown'
        
        input.addEventListener('focus', () => {
          analytics.handleFieldFocus(fieldName)
        })
      })

      // Обработчик отправки формы
      node.addEventListener('submit', (e) => {
        analytics.handleFormSubmit(true)
      })
    }
  }, [analytics])

  return {
    formRef,
    ...analytics
  }
}

// Компонент-обертка для автоматического трекинга
interface FormTrackerProps {
  formName: string
  formType?: string
  children: React.ReactNode
  className?: string
}

export function FormTracker({ formName, formType, children, className }: FormTrackerProps) {
  const { formRef } = useAutoFormTracking(formName, formType)
  
  return (
    <div ref={formRef} className={className}>
      {children}
    </div>
  )
}
