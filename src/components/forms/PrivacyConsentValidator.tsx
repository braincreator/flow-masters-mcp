'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

/**
 * Утилиты для валидации согласия на обработку персональных данных
 */

// Типы ошибок согласия
export type ConsentError = 
  | 'required'
  | 'invalid'
  | 'expired'
  | 'revoked'

// Интерфейс для результата валидации
export interface ConsentValidationResult {
  isValid: boolean
  error?: ConsentError
  message?: string
}

// Хук для валидации согласия
export function useConsentValidation() {
  const t = useTranslations('forms.privacyConsent')

  const validateConsent = (
    consent: boolean | undefined,
    required: boolean = true
  ): ConsentValidationResult => {
    if (required && !consent) {
      return {
        isValid: false,
        error: 'required',
        message: t('required')
      }
    }

    if (consent === undefined || consent === null) {
      return {
        isValid: false,
        error: 'invalid',
        message: t('required')
      }
    }

    return {
      isValid: true
    }
  }

  const getErrorMessage = (error: ConsentError): string => {
    switch (error) {
      case 'required':
        return t('required')
      case 'invalid':
        return t('required')
      case 'expired':
        return 'Согласие истекло, необходимо обновить'
      case 'revoked':
        return 'Согласие было отозвано'
      default:
        return t('required')
    }
  }

  return {
    validateConsent,
    getErrorMessage
  }
}

// Компонент для отображения ошибок согласия
interface ConsentErrorDisplayProps {
  error?: ConsentError
  message?: string
  className?: string
}

export function ConsentErrorDisplay({ 
  error, 
  message, 
  className = '' 
}: ConsentErrorDisplayProps) {
  const { getErrorMessage } = useConsentValidation()

  if (!error && !message) {
    return null
  }

  const displayMessage = message || (error ? getErrorMessage(error) : '')

  return (
    <div className={`text-destructive text-sm mt-1 ${className}`} role="alert">
      {displayMessage}
    </div>
  )
}

// Утилита для проверки обязательности согласия в формах
export function validateFormConsent(
  formData: Record<string, any>,
  consentFieldName: string = 'consent'
): { isValid: boolean; error?: string } {
  const consentValue = formData[consentFieldName]
  
  if (consentValue !== true) {
    return {
      isValid: false,
      error: 'Необходимо согласие на обработку персональных данных'
    }
  }

  return { isValid: true }
}

// Middleware для проверки согласия перед отправкой формы
export function withConsentValidation<T extends Record<string, any>>(
  submitHandler: (data: T) => Promise<void> | void,
  consentFieldName: string = 'consent'
) {
  return async (data: T) => {
    const validation = validateFormConsent(data, consentFieldName)
    
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    return submitHandler(data)
  }
}

// Компонент-обертка для форм с обязательным согласием
interface ConsentRequiredFormProps {
  children: React.ReactNode
  onSubmit: (data: any) => void
  consentFieldName?: string
  className?: string
}

export function ConsentRequiredForm({
  children,
  onSubmit,
  consentFieldName = 'consent',
  className = ''
}: ConsentRequiredFormProps) {
  const handleSubmit = withConsentValidation(onSubmit, consentFieldName)

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())
        handleSubmit(data)
      }}
      className={className}
    >
      {children}
    </form>
  )
}

// Хук для интеграции с react-hook-form
export function useConsentField(
  setValue: (name: string, value: any) => void,
  watch: (name: string) => any,
  fieldName: string = 'consent'
) {
  const { validateConsent } = useConsentValidation()
  const value = watch(fieldName)

  const setConsent = (consent: boolean) => {
    setValue(fieldName, consent)
  }

  const validate = () => {
    return validateConsent(value)
  }

  return {
    value,
    setConsent,
    validate,
    isValid: validateConsent(value).isValid
  }
}

// Константы для согласия
export const CONSENT_STORAGE_KEY = 'privacy_consent_timestamp'
export const CONSENT_EXPIRY_DAYS = 365 // Согласие действует 1 год

// Утилиты для работы с localStorage
export const consentStorage = {
  save: (timestamp: number = Date.now()) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONSENT_STORAGE_KEY, timestamp.toString())
    }
  },
  
  get: (): number | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      return stored ? parseInt(stored, 10) : null
    }
    return null
  },
  
  isValid: (): boolean => {
    const timestamp = consentStorage.get()
    if (!timestamp) return false
    
    const expiryTime = timestamp + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    return Date.now() < expiryTime
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONSENT_STORAGE_KEY)
    }
  }
}
