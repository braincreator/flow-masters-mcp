'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'

// Form validation schema
const createRegisterSchema = (t: any) =>
  z
    .object({
      name: z.string().min(2, { message: t('validation.nameRequired') }),
      email: z.string().email({ message: t('validation.invalidEmail') }),
      password: z.string().min(6, { message: t('validation.passwordTooShort') }),
      confirmPassword: z.string(),
      acceptTerms: z.boolean().refine((val) => val === true, {
        message: t('validation.acceptTerms'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })

// Define the schema type
type RegisterSchema = z.ZodEffects<
  z.ZodObject<{
    name: z.ZodString
    email: z.ZodString
    password: z.ZodString
    confirmPassword: z.ZodString
    acceptTerms: z.ZodBoolean
  }>
>

type RegisterFormValues = z.infer<RegisterSchema>

interface RegisterFormProps {
  locale?: string
}

export function RegisterForm({ locale = 'ru' }: RegisterFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/account'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get translations
  const t = useTranslations('auth')

  // Create schema with translations
  const registerSchema = createRegisterSchema(t)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  // Get auth context
  const { register: registerUser } = useAuth()

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      // Redirect to the specified page or account page
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.registrationError'))
    } finally {
      setIsLoading(false)
    }
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
          <label htmlFor="name" className="block text-sm font-medium">
            {t('name')}
          </label>
          <Input
            id="name"
            type="text"
            placeholder={t('placeholders.name')}
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            {t('email')}
          </label>
          <Input
            id="email"
            type="email"
            placeholder={t('placeholders.email')}
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            {t('password')}
          </label>
          <PasswordInput
            id="password"
            placeholder={t('placeholders.password')}
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            {t('confirmPassword')}
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder={t('placeholders.password')}
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox id="acceptTerms" {...register('acceptTerms')} />
          <label htmlFor="acceptTerms" className="text-sm">
            {t('terms.agree')}{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-800">
              {t('terms.termsOfService')}
            </Link>{' '}
            {t('terms.and')}{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
              {t('terms.privacyPolicy')}
            </Link>
          </label>
        </div>
        {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? t('register.loading') : t('createAccount')}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {t('haveAccount')}{' '}
            <Link
              href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {t('login.button')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
