/**
 * Common form types and validation schemas for FlowMasters
 */

import { z } from 'zod'

// Base form field types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: z.ZodSchema
  description?: string
}

export interface FormConfig {
  id: string
  title: string
  description?: string
  fields: FormField[]
  submitText?: string
  successMessage?: string
  errorMessage?: string
}

// Form state management
export interface FormState<T = Record<string, any>> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
  touched: Record<string, boolean>
}

// Contact Form Schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
  source: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'Необходимо согласие на обработку данных'
  })
})

type ContactFormData = z.infer<typeof contactFormSchema>

// Service Request Form Schema
const serviceRequestSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  serviceType: z.string().min(1, 'Выберите тип услуги'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  description: z.string().min(20, 'Описание должно содержать минимум 20 символов'),
  consent: z.boolean().refine(val => val === true, {
    message: 'Необходимо согласие на обработку данных'
  })
})

type ServiceRequestData = z.infer<typeof serviceRequestSchema>

// Newsletter Subscription Schema
const newsletterSchema = z.object({
  email: z.string().email('Введите корректный email'),
  name: z.string().optional(),
  preferences: z.array(z.string()).optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'Необходимо согласие на обработку данных'
  })
})

type NewsletterData = z.infer<typeof newsletterSchema>

// Callback Request Schema
const callbackSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  preferredTime: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'Необходимо согласие на обработку данных'
  })
})

type CallbackData = z.infer<typeof callbackSchema>

// Lead Form Schema (for modal lead forms)
const leadFormSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  comment: z.string().optional(),
})

type LeadFormData = z.infer<typeof leadFormSchema>

// Quote Request Schema
const quoteRequestSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  company: z.string().optional(),
  projectType: z.string().min(1, 'Выберите тип проекта'),
  budget: z.string().min(1, 'Выберите бюджет'),
  timeline: z.string().min(1, 'Выберите временные рамки'),
  requirements: z.string().min(50, 'Требования должны содержать минимум 50 символов'),
  attachments: z.array(z.string()).optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'Необходимо согласие на обработку данных'
  })
})

type QuoteRequestData = z.infer<typeof quoteRequestSchema>

// Form submission result
export interface FormSubmissionResult {
  success: boolean
  message: string
  data?: any
  errors?: Record<string, string>
  redirectUrl?: string
}

// Form validation utilities
const validateForm = <T>(schema: z.ZodSchema<T>, data: any): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} => {
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
    return { success: false, errors: { general: 'Ошибка валидации' } }
  }
}

// Form field configurations
const serviceTypes = [
  { value: 'web-development', label: 'Веб-разработка' },
  { value: 'mobile-development', label: 'Мобильная разработка' },
  { value: 'ai-integration', label: 'Интеграция ИИ' },
  { value: 'automation', label: 'Автоматизация процессов' },
  { value: 'consulting', label: 'Консультации' },
  { value: 'other', label: 'Другое' }
]

const budgetRanges = [
  { value: 'under-100k', label: 'До 100 000 ₽' },
  { value: '100k-500k', label: '100 000 - 500 000 ₽' },
  { value: '500k-1m', label: '500 000 - 1 000 000 ₽' },
  { value: '1m-3m', label: '1 000 000 - 3 000 000 ₽' },
  { value: 'over-3m', label: 'Свыше 3 000 000 ₽' },
  { value: 'discuss', label: 'Обсудим индивидуально' }
]

const timelineOptions = [
  { value: 'asap', label: 'Как можно скорее' },
  { value: '1-month', label: 'В течение месяца' },
  { value: '2-3-months', label: '2-3 месяца' },
  { value: '3-6-months', label: '3-6 месяцев' },
  { value: 'over-6-months', label: 'Более 6 месяцев' },
  { value: 'flexible', label: 'Гибкие сроки' }
]

const projectTypes = [
  { value: 'website', label: 'Корпоративный сайт' },
  { value: 'ecommerce', label: 'Интернет-магазин' },
  { value: 'web-app', label: 'Веб-приложение' },
  { value: 'mobile-app', label: 'Мобильное приложение' },
  { value: 'ai-solution', label: 'ИИ-решение' },
  { value: 'integration', label: 'Интеграция систем' },
  { value: 'other', label: 'Другое' }
]

// Export all types and schemas
export {
  contactFormSchema,
  serviceRequestSchema,
  newsletterSchema,
  callbackSchema,
  leadFormSchema,
  quoteRequestSchema,
  validateForm,
  serviceTypes,
  budgetRanges,
  timelineOptions,
  projectTypes
}

export type {
  FormField,
  FormConfig,
  FormState,
  ContactFormData,
  ServiceRequestData,
  NewsletterData,
  CallbackData,
  LeadFormData,
  QuoteRequestData,
  FormSubmissionResult
}
