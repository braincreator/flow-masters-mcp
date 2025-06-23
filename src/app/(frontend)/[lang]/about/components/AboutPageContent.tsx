import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { AboutPageComponent } from '../AboutPageComponent'
import { AboutPageJsonLd } from './AboutPageJsonLd'
import { transformAboutPageData } from '../utils/transformData'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface AboutPageContentProps {
  lang: string
}

export async function AboutPageContent({ lang }: AboutPageContentProps) {
  const payload = await getPayload({ config: configPromise })

  try {
    const aboutPageData = await payload.findGlobal({
      slug: 'about-page',
      locale: lang as 'en' | 'ru',
    })

    if (!aboutPageData) {
      return notFound()
    }

    const transformedData = transformAboutPageData(aboutPageData)

    return (
      <>
        <AboutPageJsonLd data={aboutPageData} locale={lang} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AboutPageComponent data={transformedData as any} />
      </>
    )
  } catch (error) {
    logError('Error fetching about page data:', error)
    return notFound()
  }
}
