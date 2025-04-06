'use client'

import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

// Схема валидации Zod (должна совпадать с бэкендом)
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Имя должно содержать минимум 2 символа' }),
  email: z.string().email({ message: 'Введите корректный email' }),
  subject: z.string().optional(), // Тема опциональна
  message: z.string().min(10, { message: 'Сообщение должно содержать минимум 10 символов' }),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export function ContactForm() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Не удалось отправить сообщение')
      }

      toast({
        title: 'Сообщение отправлено',
        description: 'Спасибо! Я свяжусь с вами в ближайшее время.',
      })
      reset() // Очистить форму после успешной отправки
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при отправке.',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Ваше имя *
        </label>
        <Input
          id="name"
          placeholder="Иван Иванов"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Ваш Email *
        </label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
          Тема
        </label>
        <Input
          id="subject"
          placeholder="Тема вашего сообщения (необязательно)"
          {...register('subject')}
          className={errors.subject ? 'border-destructive' : ''}
        />
        {/* Ошибки для темы обычно не критичны */}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
          Сообщение *
        </label>
        <Textarea
          id="message"
          placeholder="Напишите ваше сообщение здесь..."
          rows={6}
          {...register('message')}
          className={errors.message ? 'border-destructive' : ''}
          aria-invalid={errors.message ? 'true' : 'false'}
        />
        {errors.message && (
          <p className="text-destructive text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Отправка...
          </>
        ) : (
          'Отправить сообщение'
        )}
      </Button>
    </form>
  )
}
