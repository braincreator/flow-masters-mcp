'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Send, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

// Define the Zod schema for form validation
const createFormSchema = (validationMessages: {
  nameMin: string
  phoneMin: string
  emailInvalid: string
}) =>
  z.object({
    name: z.string().min(2, { message: validationMessages.nameMin }),
    phone: z.string().min(10, { message: validationMessages.phoneMin }),
    email: z.string().email({ message: validationMessages.emailInvalid }),
    contactMethod: z.string().optional(), // For Telegram/WhatsApp
  })

type FormData = z.infer<ReturnType<typeof createFormSchema>>

interface Translations {
  name: string
  namePlaceholder: string
  phone: string
  phonePlaceholder: string
  email: string
  emailPlaceholder: string
  contactMethod: string
  contactMethodPlaceholder: string
  telegram: string // Added for select options if needed, or can be part of a general group
  whatsapp: string // Added for select options if needed
  submit: string
  submitting: string
  successTitle: string
  successMessage: string // e.g., "Your order for {serviceName} has been received."
  telegramButton: string
  errorTitle: string
  errorMessage: string
  formNotAvailable: string
  validation: {
    nameMin: string
    phoneMin: string
    emailInvalid: string
  }
}

type OrderContactFormProps = {
  serviceId: string
  serviceName: string
  lang: string
  translations: Translations // Changed from t function to translations object
  telegramBotUrl: string
}

export default function OrderContactForm({
  serviceId,
  serviceName,
  lang,
  translations, // Use translations object
  telegramBotUrl,
}: OrderContactFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [formId, setFormId] = useState<string | null>(null)
  const [formLoadingError, setFormLoadingError] = useState<string | null>(null)

  const formSchema = createFormSchema(translations.validation) // Pass validation messages

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // Fetch Form ID
  useEffect(() => {
    const fetchFormId = async () => {
      try {
        const response = await fetch(
          `/api/forms?where[title][equals]=General Lead Form&limit=1&depth=0`,
        )
        if (!response.ok) {
          throw new Error('Failed to fetch form configuration')
        }
        const data = await response.json()
        if (data.docs && data.docs.length > 0) {
          setFormId(data.docs[0].id)
        } else {
          throw new Error('"General Lead Form" not found.')
        }
      } catch (error) {
        console.error('Error fetching formId:', error)
        const errorMessage =
          translations.formNotAvailable || 'Could not load form. Please try again later.'
        setFormLoadingError(errorMessage)
        toast({
          variant: 'destructive',
          title: translations.errorTitle || 'Error',
          description: errorMessage,
        })
      }
    }
    fetchFormId()
  }, [toast, translations]) // Depend on translations object

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!formId) {
      const errorMsg =
        translations.formNotAvailable || 'Form ID is not available. Cannot submit.'
      setSubmissionError(errorMsg)
      toast({
        variant: 'destructive',
        title: translations.errorTitle || 'Error',
        description: errorMsg,
      })
      return
    }
    setIsSubmitting(true)
    setSubmissionError(null)

    const submissionData = [
      { field: 'name', value: data.name },
      { field: 'phone', value: data.phone },
      { field: 'email', value: data.email },
      { field: 'contactMethod', value: data.contactMethod || '' },
      { field: 'serviceOrdered', value: serviceName },
      { field: 'serviceId', value: serviceId },
    ]

    try {
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: formId,
          submissionData: submissionData,
          actionType: 'Service Order',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit form')
      }

      setSubmissionSuccess(true)
      reset() // Reset form fields
      toast({
        variant: 'default',
        title: translations.successTitle || 'Success!',
        description:
          translations.successMessage.replace('{serviceName}', serviceName) ||
          'Your order has been received.',
        className: 'bg-green-500 text-white',
      })
    } catch (error: any) {
      console.error('Submission error:', error)
      const errorMsg =
        error.message ||
        translations.errorMessage ||
        'Could not process your order. Please try again.'
      setSubmissionError(errorMsg)
      toast({
        variant: 'destructive',
        title: translations.errorTitle || 'Submission Failed',
        description: errorMsg,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (formLoadingError) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-red-700 mb-2">
          {translations.errorTitle || 'Error'}
        </h3>
        <p className="text-red-600">{formLoadingError}</p>
      </div>
    )
  }

  if (submissionSuccess) {
    return (
      <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-700 mb-2">
          {translations.successTitle || 'Order Received!'}
        </h3>
        <p className="text-green-600 mb-6">
          {translations.successMessage.replace('{serviceName}', serviceName) ||
            'Thank you for your order. We will contact you shortly.'}
        </p>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link href={telegramBotUrl || '#'} target="_blank" rel="noopener noreferrer">
            <Send className="mr-2 h-4 w-4" />
            {translations.telegramButton || 'Go to Telegram Bot'}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">{translations.name || 'Name'}</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={translations.namePlaceholder || 'Your Name'}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">{translations.phone || 'Phone'}</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder={translations.phonePlaceholder || 'Your Phone Number'}
        />
        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">{translations.email || 'Email'}</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder={translations.emailPlaceholder || 'Your Email Address'}
        />
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="contactMethod">
          {translations.contactMethod || 'Preferred Contact Method (Optional)'}
        </Label>
        <Input
          id="contactMethod"
          {...register('contactMethod')}
          placeholder={
            translations.contactMethodPlaceholder || 'e.g., Telegram @username or WhatsApp number'
          }
        />
        {errors.contactMethod && (
          <p className="text-sm text-red-500 mt-1">{errors.contactMethod.message}</p>
        )}
      </div>

      {submissionError && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
          <p>{submissionError}</p>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting || !formId} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {translations.submitting || 'Submitting...'}
          </>
        ) : (
          translations.submit || 'Submit Order'
        )}
      </Button>
    </form>
  )
}
