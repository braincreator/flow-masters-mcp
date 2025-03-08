'use client'

import { useI18n } from '@/components/ClientProviders'
import { Hero } from '@/components/Hero'
import { Grid } from '@/components/Grid'
import { Banner } from '@/components/Banner'
import { Testimonial } from '@/components/Testimonial'

type SerializedPage = {
  id: string
  title: string
  hero: {
    type: string
    richText: any // Using any for now, but you might want to define a proper type for richText
    media?: {
      id: string
      url: string
    }
    links?: Array<{
      link: {
        type: string
        appearance: string
        label: string
        url: string
      }
    }>
  }
  layout?: Array<{
    blockType: string
    [key: string]: any
  }>
  meta?: {
    title: string
    description: string
    image?: {
      id: string
      url: string
    }
  }
}

export function LandingPage({ page, lang }: { page: SerializedPage; lang: string }) {
  const { lang: currentLang } = useI18n()

  return (
    <div className="min-h-screen">
      <Hero title={page.title} content={page.hero.richText} />
      <Grid />
      <Banner />
      <Testimonial />
    </div>
  )
}
