'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar } from 'lucide-react'
import { Image } from '@/components/Image'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type ServiceHeroProps = {
  title: string
  shortDescription?: string
  thumbnailUrl?: string
  serviceType: string
  serviceTypeLabel: string
  locale: string
  slug: string
  requiresBooking?: boolean
  translations: Record<string, string>
}

export default function ServiceHero({
  title,
  shortDescription,
  thumbnailUrl = '/images/placeholder-service.jpg',
  serviceType,
  serviceTypeLabel,
  locale,
  slug,
  requiresBooking = false,
  translations,
}: ServiceHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Фоновое изображение с градиентным наложением */}
      <div className="relative aspect-[21/9] min-h-[300px]">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill={true}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          priority={true}
        />
        {/* Градиентное наложение для улучшения читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
      </div>

      {/* Контент поверх изображения */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12 z-10">
        <div className="max-w-3xl">
          <Badge className="inline-flex items-center bg-primary/90 text-white border-none px-3 py-1 text-xs uppercase tracking-wider font-medium mb-4 shadow-md">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            {serviceTypeLabel}
          </Badge>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{title}</h1>

          {shortDescription && (
            <p className="text-lg text-white/80 mb-6 max-w-2xl">{shortDescription}</p>
          )}

          <div className="flex flex-wrap gap-4">
            {requiresBooking ? (
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-white font-medium group"
                size="lg"
              >
                <Link href={`/${locale}/services/${slug}/book`}>
                  <span className="flex items-center">
                    {translations.book || 'Book Now'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-white font-medium group"
                size="lg"
              >
                {/* Changed link to point to the new order form page for non-booking services */}
                <Link href={`/${locale}/services/${slug}/order-form`}>
                  <span className="flex items-center">
                    {translations.order || 'Order Service'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
