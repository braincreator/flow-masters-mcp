'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useFormAnalytics } from '@/hooks/useFormAnalytics'
import { usePixelEvents } from '@/hooks/usePixelEvents'
import {
  createFormMetadata,
  initializeMetadataTracking,
  getLocationInfo,
  trackPageVisit
} from '@/utilities/formMetadata'
import { getUserTracker } from '@/utilities/userTracking'
import type { 
  FormMetadata, 
  FormContext, 
  FormSubmissionData, 
  EnhancedFormSubmission,
  MetadataCollectionConfig 
} from '@/types/formMetadata'

// Конфигурация хука
interface UseEnhancedFormSubmissionConfig {
  formName: string
  formType: string
  formId?: string
  formLocation?: string
  apiEndpoint?: string
  collectLocation?: boolean
  metadataConfig?: Partial<MetadataCollectionConfig>
  onSuccess?: (response: any) => void
  onError?: (error: Error) => void
  enableAnalytics?: boolean
  enableTracking?: boolean
}

// Состояние отправки формы
interface FormSubmissionState {
  isLoading: boolean
  isSuccess: boolean
  error: string | null
  response: any
  submissionId?: string
}

// Данные для отправки
interface SubmissionPayload {
  form?: string
  submissionData: FormSubmissionData[]
  metadata?: FormMetadata
  [key: string]: any
}

/**
 * Хук для обогащенной отправки форм с максимальным сбором метаданных
 */
export function useEnhancedFormSubmission(config: UseEnhancedFormSubmissionConfig) {
  const {
    formName,
    formType,
    formId,
    formLocation = 'unknown',
    apiEndpoint = '/api/form-submissions',
    collectLocation = false,
    metadataConfig = {},
    onSuccess,
    onError,
    enableAnalytics = true,
    enableTracking = true,
  } = config

  // Состояние
  const [state, setState] = useState<FormSubmissionState>({
    isLoading: false,
    isSuccess: false,
    error: null,
    response: null,
  })

  // Аналитика
  const formAnalytics = useFormAnalytics({
    formName,
    formType,
    trackFieldFocus: enableTracking,
    trackFieldBlur: enableTracking,
    trackFieldErrors: enableTracking,
  })
  const pixelEvents = usePixelEvents()

  // Трекер пользователя
  const userTracker = useRef(enableTracking ? getUserTracker() : null)
  const formStarted = useRef(false)
  const submissionAttempt = useRef(0)

  // Инициализация отслеживания
  useEffect(() => {
    if (enableTracking && typeof window !== 'undefined') {
      initializeMetadataTracking()
      trackPageVisit()
    }
  }, [enableTracking])

  /**
   * Создает контекст формы
   */
  const createFormContext = useCallback((): FormContext => {
    submissionAttempt.current += 1

    return {
      form_id: formId,
      form_type: formType,
      form_name: formName,
      form_location: formLocation,
      form_trigger: 'manual', // Можно расширить
      modal_context: formLocation.includes('modal'),
      submission_attempt: submissionAttempt.current,
      auto_filled_fields: [], // Можно определить автозаполненные поля
      validation_errors: [], // Будет заполнено при ошибках валидации
    }
  }, [formId, formType, formName, formLocation])

  /**
   * Собирает все метаданные формы
   */
  const collectMetadata = useCallback(async (): Promise<FormMetadata> => {
    const formContext = createFormContext()
    let metadata = createFormMetadata(formContext, metadataConfig)

    // Добавляем данные трекинга пользователя
    if (userTracker.current) {
      const trackingData = userTracker.current.getTrackingData()
      
      metadata.user_behavior = {
        ...metadata.user_behavior,
        time_on_page: Math.round(trackingData.time.active_time / 1000),
        scroll_depth: trackingData.scroll.max_scroll,
        max_scroll_depth: trackingData.scroll.max_scroll,
        mouse_movements: trackingData.mouse.movements,
        clicks_count: trackingData.mouse.clicks,
        form_interactions: userTracker.current.getFormInteractions(formId || formName),
      }

      metadata.technical_metadata = {
        ...metadata.technical_metadata,
        form_load_time: trackingData.time.total_time,
      }
    }

    // Добавляем геолокацию, если разрешено
    if (collectLocation) {
      try {
        const locationInfo = await getLocationInfo()
        if (locationInfo) {
          metadata.location_info = { ...metadata.location_info, ...locationInfo }
        }
      } catch (error) {
        console.warn('Could not get location:', error)
      }
    }

    return metadata
  }, [createFormContext, metadataConfig, collectLocation, formId, formName])

  /**
   * Обрабатывает начало заполнения формы
   */
  const handleFormStart = useCallback(() => {
    if (!formStarted.current) {
      formStarted.current = true
      
      if (enableAnalytics) {
        formAnalytics.handleFormStart()
        pixelEvents.trackEvent('form_start', {
          content_name: formName,
          content_category: formType,
          form_location: formLocation,
        })
      }
    }
  }, [enableAnalytics, formAnalytics, pixelEvents, formName, formType, formLocation])

  /**
   * Обрабатывает взаимодействие с полем формы
   */
  const handleFieldInteraction = useCallback((
    fieldName: string, 
    action: 'focus' | 'blur' | 'change' | 'error',
    value?: any,
    errorMessage?: string
  ) => {
    // Запускаем отслеживание формы при первом взаимодействии
    handleFormStart()

    // Трекинг в аналитике
    if (enableAnalytics && action === 'focus') {
      formAnalytics.handleFieldFocus(fieldName)
    }

    // Трекинг в пользовательском трекере
    if (enableTracking && userTracker.current) {
      userTracker.current.trackFormInteraction(
        formId || formName,
        fieldName,
        action,
        value,
        errorMessage
      )
    }
  }, [handleFormStart, enableAnalytics, enableTracking, formAnalytics, formId, formName])

  /**
   * Преобразует данные формы в стандартный формат
   */
  const formatSubmissionData = useCallback((formData: Record<string, any>): FormSubmissionData[] => {
    return Object.entries(formData).map(([field, value]) => ({
      field,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      type: typeof value,
      required: false, // Можно определить из схемы формы
      validation_passed: true, // Можно определить из результатов валидации
    }))
  }, [])

  /**
   * Отправляет форму с полными метаданными
   */
  const submitForm = useCallback(async (
    formData: Record<string, any>,
    options: {
      skipMetadata?: boolean
      customEndpoint?: string
      additionalData?: Record<string, any>
    } = {}
  ) => {
    const { skipMetadata = false, customEndpoint, additionalData = {} } = options

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Собираем метаданные
      const metadata = skipMetadata ? undefined : await collectMetadata()

      // Форматируем данные
      const submissionData = formatSubmissionData(formData)

      // Создаем payload
      const payload: SubmissionPayload = {
        submissionData,
        ...additionalData,
      }

      // Добавляем ID формы, если есть
      if (formId) {
        payload.form = formId
      }

      // Добавляем метаданные, если не пропускаем
      if (metadata) {
        payload.metadata = metadata
      }

      // Отправляем запрос
      const endpoint = customEndpoint || apiEndpoint
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Submission failed')
      }

      // Успешная отправка
      setState({
        isLoading: false,
        isSuccess: true,
        error: null,
        response: responseData,
        submissionId: responseData.submission?.id || responseData.id,
      })

      // Аналитика успешной отправки
      if (enableAnalytics) {
        formAnalytics.handleFormSubmit(true)
        pixelEvents.trackEvent('form_submit_success', {
          content_name: formName,
          content_category: formType,
          form_location: formLocation,
          submission_id: responseData.submission?.id || responseData.id,
        })
      }

      // Колбэк успеха
      if (onSuccess) {
        onSuccess(responseData)
      }

      return responseData

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      setState({
        isLoading: false,
        isSuccess: false,
        error: errorMessage,
        response: null,
      })

      // Аналитика ошибки
      if (enableAnalytics) {
        formAnalytics.handleFormSubmit(false)
        pixelEvents.trackEvent('form_submit_error', {
          content_name: formName,
          content_category: formType,
          form_location: formLocation,
          error: errorMessage,
        })
      }

      // Колбэк ошибки
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage))
      }

      throw error
    }
  }, [
    collectMetadata,
    formatSubmissionData,
    formId,
    apiEndpoint,
    enableAnalytics,
    formAnalytics,
    pixelEvents,
    formName,
    formType,
    formLocation,
    onSuccess,
    onError,
  ])

  /**
   * Сбрасывает состояние формы
   */
  const resetForm = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      error: null,
      response: null,
    })
    formStarted.current = false
    submissionAttempt.current = 0
  }, [])

  return {
    // Состояние
    ...state,
    
    // Методы
    submitForm,
    resetForm,
    handleFormStart,
    handleFieldInteraction,
    
    // Утилиты
    collectMetadata,
    formatSubmissionData,
    
    // Аналитика
    formAnalytics: enableAnalytics ? formAnalytics : null,
  }
}
