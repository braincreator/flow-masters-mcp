'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface SupportFormProps {
  locale: string
}

export function SupportForm({ locale }: SupportFormProps) {
  const t = useTranslations('Support')
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Define form schema
  const supportSchema = z.object({
    name: z.string().min(2, t('validation.nameRequired')),
    email: z.string().email(t('validation.emailInvalid')),
    subject: z.string().min(2, t('validation.subjectRequired')),
    category: z.string().min(1, t('validation.categoryRequired')),
    message: z.string().min(10, t('validation.messageMinLength')),
  })

  type SupportFormValues = z.infer<typeof supportSchema>

  // Initialize form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      category: '',
      message: '',
    },
  })

  // Set user data when available
  useState(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
    }
  })

  // Handle form submission
  const onSubmit = async (data: SupportFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // In a real app, you would send this data to your API
      // const response = await fetch('/api/support', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // if (!response.ok) throw new Error('Failed to submit support request')

      setSuccess(t('successMessage'))
      reset()
    } catch (err) {
      logError('Error submitting support request:', err)
      setError(t('errorMessage'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('formTitle')}</CardTitle>
        <CardDescription>{t('formDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                {t('nameLabel')}
              </label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                {t('emailLabel')}
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium">
                {t('subjectLabel')}
              </label>
              <Input
                id="subject"
                type="text"
                {...register('subject')}
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium">
                {t('categoryLabel')}
              </label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                defaultValue=""
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">{t('categories.technical')}</SelectItem>
                  <SelectItem value="billing">{t('categories.billing')}</SelectItem>
                  <SelectItem value="account">{t('categories.account')}</SelectItem>
                  <SelectItem value="courses">{t('categories.courses')}</SelectItem>
                  <SelectItem value="feedback">{t('categories.feedback')}</SelectItem>
                  <SelectItem value="other">{t('categories.other')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium">
              {t('messageLabel')}
            </label>
            <Textarea
              id="message"
              rows={5}
              {...register('message')}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => reset()}>
          {t('resetButton')}
        </Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('submittingButton')}
            </>
          ) : (
            t('submitButton')
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
