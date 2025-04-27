'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
// Define User interface based on AuthProvider
interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
  level?: number
  xp?: number
  xpToNextLevel?: number
  streak?: number
  lastActive?: string
  bio?: string
}

interface ProfileSettingsProps {
  user: User
  locale: string
}

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileSettings({ user, locale }: ProfileSettingsProps) {
  const t = useTranslations('Settings.profile')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    setSuccess('')
    setError('')

    try {
      // Here you would implement the API call to update the user profile
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(t('successMessage'))
    } catch (err) {
      setError(t('errorMessage'))
      console.error('Error updating profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate initials for avatar fallback
  const initials = user.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-24 w-24">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex gap-2 mt-2">
                  <Button type="button" size="sm" variant="outline" className="flex gap-1">
                    <Upload className="h-4 w-4" />
                    <span>{t('uploadAvatar')}</span>
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="flex gap-1">
                    <Trash2 className="h-4 w-4" />
                    <span>{t('removeAvatar')}</span>
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    {t('nameLabel')}
                  </label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder={user.name || ''}
                    className="w-full"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('emailLabel')}
                  </label>
                  <Input id="email" value={user.email} disabled className="w-full bg-muted" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    {t('bioLabel')}
                  </label>
                  <Textarea
                    id="bio"
                    {...form.register('bio')}
                    placeholder={t('bioPlaceholder')}
                    className="w-full min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('savingButton')}
                </>
              ) : (
                t('saveButton')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
