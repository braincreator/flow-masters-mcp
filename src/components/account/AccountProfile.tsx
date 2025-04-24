'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import UserLevel from '@/components/Users/UserLevel'

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
}

interface AccountProfileProps {
  user: User
  locale: string
}

const profileSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If any password field is filled, all password fields must be filled
      const hasCurrentPassword = !!data.currentPassword
      const hasNewPassword = !!data.newPassword
      const hasConfirmPassword = !!data.confirmPassword

      // If any password field is filled, all must be filled
      if (hasCurrentPassword || hasNewPassword || hasConfirmPassword) {
        return hasCurrentPassword && hasNewPassword && hasConfirmPassword
      }

      return true
    },
    {
      message: 'All password fields are required to change password',
      path: ['currentPassword'],
    },
  )
  .refine(
    (data) => {
      // If new password is provided, it must match confirm password
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword
      }
      return true
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  )

type ProfileFormValues = z.infer<typeof profileSchema>

export function AccountProfile({ user, locale }: AccountProfileProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare the update data
      const updateData: any = {
        name: data.name,
      }

      // Only include password fields if they are all provided
      if (data.currentPassword && data.newPassword) {
        updateData.password = data.newPassword
        updateData.currentPassword = data.currentPassword
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }

      // Clear password fields
      reset({
        name: data.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
        <div className="mt-4">
          <UserLevel userId={user.id} />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
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
              Email (cannot be changed)
            </label>
            <Input id="email" type="email" value={user.email} disabled />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-medium">
                  Current Password
                </label>
                <PasswordInput
                  id="currentPassword"
                  {...register('currentPassword')}
                  className={errors.currentPassword ? 'border-red-500' : ''}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium">
                  New Password
                </label>
                <PasswordInput
                  id="newPassword"
                  {...register('newPassword')}
                  className={errors.newPassword ? 'border-red-500' : ''}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm New Password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
