/**
 * Локализованные схемы валидации
 * Заменяет hardcoded сообщения на локализованные
 */

import { z } from 'zod'
import type { SupportedLocale } from '@/config/i18n'

// Типы для локализованных сообщений
interface ValidationMessages {
  required: string
  email: string
  minLength: (min: number) => string
  maxLength: (max: number) => string
  min: (min: number) => string
  max: (max: number) => string
  phone: string
  url: string
  consent: string
  passwordMismatch: string
  invalidFormat: string
}

// Сообщения валидации для разных локалей
const validationMessages: Record<SupportedLocale, ValidationMessages> = {
  ru: {
    required: 'Это поле обязательно для заполнения',
    email: 'Введите корректный email адрес',
    minLength: (min) => `Минимум ${min} символов`,
    maxLength: (max) => `Максимум ${max} символов`,
    min: (min) => `Минимальное значение: ${min}`,
    max: (max) => `Максимальное значение: ${max}`,
    phone: 'Введите корректный номер телефона',
    url: 'Введите корректный URL',
    consent: 'Необходимо согласие на обработку данных',
    passwordMismatch: 'Пароли не совпадают',
    invalidFormat: 'Неверный формат данных'
  },
  en: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: (min) => `Minimum ${min} characters`,
    maxLength: (max) => `Maximum ${max} characters`,
    min: (min) => `Minimum value: ${min}`,
    max: (max) => `Maximum value: ${max}`,
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    consent: 'Data processing consent is required',
    passwordMismatch: 'Passwords do not match',
    invalidFormat: 'Invalid data format'
  }
}

// Функция для получения сообщений валидации
export function getValidationMessages(locale: SupportedLocale = 'ru'): ValidationMessages {
  return validationMessages[locale]
}

// Создание локализованных схем
export function createLocalizedSchemas(locale: SupportedLocale = 'ru') {
  const messages = getValidationMessages(locale)

  // Базовые схемы
  const email = z.string().email(messages.email)
  const phone = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, messages.phone).optional()
  const url = z.string().url(messages.url)
  const consent = z.boolean().refine((val) => val === true, { message: messages.consent })

  // Схема контактной формы
  const contactForm = z.object({
    name: z.string().min(2, messages.minLength(2)),
    email,
    phone,
    company: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(10, messages.minLength(10)),
    source: z.string().optional(),
    consent
  })

  // Схема заявки на услугу
  const serviceRequest = z.object({
    name: z.string().min(2, messages.minLength(2)),
    email,
    phone,
    company: z.string().optional(),
    serviceType: z.string().min(1, messages.required),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    description: z.string().min(20, messages.minLength(20)),
    consent
  })

  // Схема подписки на рассылку
  const newsletter = z.object({
    email,
    name: z.string().min(2, messages.minLength(2)).optional(),
    consent
  })

  // Схема регистрации
  const registration = z.object({
    name: z.string().min(2, messages.minLength(2)),
    email,
    password: z.string().min(8, messages.minLength(8)),
    confirmPassword: z.string(),
    phone: phone.optional(),
    consent
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordMismatch,
    path: ['confirmPassword']
  })

  // Схема входа
  const login = z.object({
    email,
    password: z.string().min(1, messages.required)
  })

  // Схема сброса пароля
  const passwordReset = z.object({
    email
  })

  // Схема изменения пароля
  const passwordChange = z.object({
    currentPassword: z.string().min(1, messages.required),
    newPassword: z.string().min(8, messages.minLength(8)),
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: messages.passwordMismatch,
    path: ['confirmPassword']
  })

  // Схема профиля пользователя
  const userProfile = z.object({
    name: z.string().min(2, messages.minLength(2)),
    email,
    phone,
    company: z.string().optional(),
    bio: z.string().max(500, messages.maxLength(500)).optional(),
    website: z.string().url(messages.url).optional(),
    location: z.string().optional()
  })

  // Схема комментария
  const comment = z.object({
    content: z.string().min(10, messages.minLength(10)).max(1000, messages.maxLength(1000)),
    author: z.string().min(2, messages.minLength(2)),
    email,
    website: z.string().url(messages.url).optional()
  })

  // Схема отзыва
  const review = z.object({
    rating: z.number().min(1, messages.min(1)).max(5, messages.max(5)),
    title: z.string().min(5, messages.minLength(5)).max(100, messages.maxLength(100)),
    content: z.string().min(20, messages.minLength(20)).max(1000, messages.maxLength(1000)),
    author: z.string().min(2, messages.minLength(2)),
    email,
    recommend: z.boolean().optional()
  })

  return {
    contactForm,
    serviceRequest,
    newsletter,
    registration,
    login,
    passwordReset,
    passwordChange,
    userProfile,
    comment,
    review,
    // Базовые типы для переиспользования
    email,
    phone,
    url,
    consent
  }
}

// Типы для TypeScript
export type ContactFormData = z.infer<ReturnType<typeof createLocalizedSchemas>['contactForm']>
export type ServiceRequestData = z.infer<ReturnType<typeof createLocalizedSchemas>['serviceRequest']>
export type NewsletterData = z.infer<ReturnType<typeof createLocalizedSchemas>['newsletter']>
export type RegistrationData = z.infer<ReturnType<typeof createLocalizedSchemas>['registration']>
export type LoginData = z.infer<ReturnType<typeof createLocalizedSchemas>['login']>
export type UserProfileData = z.infer<ReturnType<typeof createLocalizedSchemas>['userProfile']>
export type CommentData = z.infer<ReturnType<typeof createLocalizedSchemas>['comment']>
export type ReviewData = z.infer<ReturnType<typeof createLocalizedSchemas>['review']>

// Утилита для валидации с локализованными сообщениями
export function validateWithLocale<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  locale: SupportedLocale = 'ru'
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    
    const messages = getValidationMessages(locale)
    return { success: false, errors: { general: messages.invalidFormat } }
  }
}
