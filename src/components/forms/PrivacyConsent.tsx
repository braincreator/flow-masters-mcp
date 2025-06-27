'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface PrivacyConsentProps {
  /** Уникальный ID для чекбокса */
  id: string
  /** Состояние чекбокса */
  checked: boolean
  /** Обработчик изменения состояния */
  onCheckedChange: (checked: boolean) => void
  /** Сообщение об ошибке валидации */
  error?: string
  /** Дополнительные CSS классы */
  className?: string
  /** Размер компонента */
  size?: 'sm' | 'md' | 'lg'
  /** Кастомный текст согласия (если не нужны переводы) */
  customText?: string
  /** Кастомная ссылка на политику конфиденциальности */
  customPolicyUrl?: string
  /** Отключить компонент */
  disabled?: boolean
  /** Обязательное поле */
  required?: boolean
}

export function PrivacyConsent({
  id,
  checked,
  onCheckedChange,
  error,
  className,
  size = 'md',
  customText,
  customPolicyUrl,
  disabled = false,
  required = true,
}: PrivacyConsentProps) {
  const t = useTranslations('forms.privacyConsent')
  const locale = useLocale()

  // Размеры компонента
  const sizeClasses = {
    sm: {
      text: 'text-xs',
      checkbox: 'h-3 w-3',
      spacing: 'gap-2',
    },
    md: {
      text: 'text-sm',
      checkbox: 'h-4 w-4',
      spacing: 'gap-3',
    },
    lg: {
      text: 'text-base',
      checkbox: 'h-5 w-5',
      spacing: 'gap-4',
    },
  }

  const currentSize = sizeClasses[size]

  // URL политики конфиденциальности
  const policyUrl = customPolicyUrl || `/${locale}/privacy`

  // Текст согласия
  const consentText = customText || t('text')
  const policyLinkText = t('policyLink')

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex items-start', currentSize.spacing)}>
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            currentSize.checkbox,
            'mt-0.5 flex-shrink-0',
            'rounded-md border-2 transition-all duration-200',
            'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
            'data-[state=checked]:text-primary-foreground',
            'hover:border-primary/60 focus:ring-2 focus:ring-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error &&
              'border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive',
          )}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? 'true' : 'false'}
          required={required}
        />

        <Label
          htmlFor={id}
          className={cn(
            currentSize.text,
            'leading-relaxed cursor-pointer select-none',
            'transition-colors duration-200',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'text-destructive',
          )}
        >
          {consentText}{' '}
          <Link
            href={policyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'text-primary hover:text-primary/80 underline underline-offset-2',
              'inline-flex items-center gap-1 transition-all duration-200 group',
              'hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm',
              disabled && 'pointer-events-none opacity-50',
            )}
            onClick={(e) => {
              // Предотвращаем всплытие события к Label
              e.stopPropagation()
            }}
          >
            {policyLinkText}
            <ExternalLink
              className={cn(
                'transition-transform duration-200',
                size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5',
                'group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
              )}
            />
          </Link>
          {required && (
            <span className="text-destructive ml-1" aria-label="обязательное поле">
              *
            </span>
          )}
        </Label>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className={cn(
            'text-destructive font-medium',
            currentSize.text,
            'ml-6 animate-in slide-in-from-top-1 duration-200', // Отступ для выравнивания с текстом + анимация
            'flex items-center gap-1',
          )}
          role="alert"
        >
          <span className="text-destructive">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}

// Хук для упрощения использования компонента
export function usePrivacyConsent(initialValue = false) {
  const [checked, setChecked] = React.useState(initialValue)
  const [error, setError] = React.useState<string>('')
  const t = useTranslations('forms.privacyConsent')

  const validate = () => {
    if (!checked) {
      setError(t('required'))
      return false
    }
    setError('')
    return true
  }

  const reset = () => {
    setChecked(false)
    setError('')
  }

  return {
    checked,
    setChecked,
    error,
    setError,
    validate,
    reset,
  }
}

// Компонент для интеграции с react-hook-form
interface PrivacyConsentFieldProps
  extends Omit<PrivacyConsentProps, 'checked' | 'onCheckedChange' | 'error'> {
  /** Значение из react-hook-form */
  value?: boolean
  /** Обработчик изменения для react-hook-form */
  onChange?: (value: boolean) => void
  /** Ошибка из react-hook-form */
  error?: string
}

export function PrivacyConsentField({
  value = false,
  onChange,
  error,
  ...props
}: PrivacyConsentFieldProps) {
  return (
    <PrivacyConsent
      checked={value}
      onCheckedChange={(checked) => onChange?.(checked)}
      error={error}
      {...props}
    />
  )
}
