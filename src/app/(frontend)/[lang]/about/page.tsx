import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'

import { AboutPageComponent } from './AboutPageComponent'
import { AboutPageSkeleton } from './components/AboutPageSkeleton'
import { AboutPageContent } from './components/AboutPageContent'

type Props = {
  params: Promise<{
    lang: string
  }>
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params
  setRequestLocale(lang)

  return (
    <Suspense fallback={<AboutPageSkeleton />}>
      <AboutPageContent lang={lang} />
    </Suspense>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const payload = await getPayload({ config: configPromise })

  try {
    const aboutPageData = await payload.findGlobal({
      slug: 'about-page',
      locale: lang as 'en' | 'ru',
    })

    const seo = aboutPageData?.seo

    return {
      title: seo?.title || (lang === 'ru' ? 'О нас - Flow Masters' : 'About Us - Flow Masters'),
      description:
        seo?.description ||
        (lang === 'ru'
          ? 'Узнайте о Flow Masters - новом ИИ-агентстве с опытным основателем'
          : 'Learn about Flow Masters - a new AI agency with an experienced founder'),
      keywords: seo?.keywords,
      openGraph: {
        title: seo?.title || (lang === 'ru' ? 'О нас - Flow Masters' : 'About Us - Flow Masters'),
        description:
          seo?.description ||
          (lang === 'ru'
            ? 'Узнайте о Flow Masters - новом ИИ-агентстве с опытным основателем'
            : 'Learn about Flow Masters - a new AI agency with an experienced founder'),
        images: seo?.ogImage
          ? [
              {
                url: typeof seo.ogImage === 'string' ? seo.ogImage : seo.ogImage.url || '',
                width: 1200,
                height: 630,
                alt: seo?.title || 'Flow Masters About',
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.title || (lang === 'ru' ? 'О нас - Flow Masters' : 'About Us - Flow Masters'),
        description:
          seo?.description ||
          (lang === 'ru'
            ? 'Узнайте о Flow Masters - новом ИИ-агентстве с опытным основателем'
            : 'Learn about Flow Masters - a new AI agency with an experienced founder'),
        images: seo?.ogImage
          ? [typeof seo.ogImage === 'string' ? seo.ogImage : seo.ogImage.url || '']
          : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for about page:', error)
    return {
      title: lang === 'ru' ? 'О нас - Flow Masters' : 'About Us - Flow Masters',
      description:
        lang === 'ru'
          ? 'Узнайте о Flow Masters - новом ИИ-агентстве с опытным основателем'
          : 'Learn about Flow Masters - a new AI agency with an experienced founder',
    }
  }
}
