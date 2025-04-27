'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

// Form validation schema
const createResetPasswordSchema = (t: any) =>
  z
    .object({
      password: z.string().min(6, {
        message: t('validation.passwordTooShort'),
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })

type ResetPasswordSchema = z.ZodEffects<
  z.ZodObject<{
    password: z.ZodString
    confirmPassword: z.ZodString
  }>
>

type ResetPasswordFormValues = z.infer<ResetPasswordSchema>

interface ResetPasswordFormProps {
  token: string
  locale: string
}

export function ResetPasswordForm({ token, locale }: ResetPasswordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Get translations
  const t = useTranslations('auth')
  const commonT = useTranslations('common')

  // Create schema with translations
  const resetPasswordSchema = createResetPasswordSchema(t)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t('resetPassword.errors.resetFailed'))
      }

      // Show success message
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resetPassword.errors.resetError'))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {t('resetPassword.successMessage')}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button asChild variant="default">
            <Link href={`/${locale}/login`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('resetPassword.loginButton')}
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
          <label htmlFor="password" className="block text-sm font-medium">
            {commonT('password')}
          </label>
          <PasswordInput
            id="password"
            placeholder={t('resetPassword.passwordPlaceholder')}
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            {commonT('confirmPassword')}
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? t('resetPassword.resetting') : t('resetPassword.resetButton')}
        </Button>
      </form>
    </div>
  )
}
