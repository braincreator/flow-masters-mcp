'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

// Form validation schema
const createForgotPasswordSchema = (t: any) =>
  z.object({
    email: z.string().email({ message: t('validation.invalidEmail') }),
  })

type ForgotPasswordSchema = z.ZodObject<{
  email: z.ZodString
}>

type ForgotPasswordFormValues = z.infer<ForgotPasswordSchema>

interface ForgotPasswordFormProps {
  locale: string
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Get translations
  const t = useTranslations('auth.forgotPassword')
  const commonT = useTranslations('common')

  // Create schema with translations
  const forgotPasswordSchema = createForgotPasswordSchema(t)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t('errors.requestFailed'))
      }

      // Show success message
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.requestError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {t('successMessage')}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button asChild variant="outline">
            <Link href={`/${locale}/login`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('backToLogin')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            {commonT('email')}
          </label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? t('requestingReset') : t('resetButton')}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {t('rememberPassword')}{' '}
            <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-800">
              {t('loginLink')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
