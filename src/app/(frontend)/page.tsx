import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { draftMode } from 'next/headers'
import { homeStatic } from '@/endpoints/seed/home-static'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import PageClient from './[lang]/[slug]/page.client'
import { DEFAULT_LOCALE } from '@/constants'
import { Suspense } from 'react'
import { OptimizedLoader } from '@/components/ui/OptimizedLoader'

export default async function Page() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  let page = await payload
    .find({
      collection: 'pages',
      where: {
        slug: {
          equals: 'home',
        },
      },
      locale: DEFAULT_LOCALE,
    })
    .then((result) => result.docs[0])

  // Fallback to static content if no home page exists
  if (!page) {
    page = homeStatic
  }

  const { hero, layout } = page

  return (
    <article className="min-h-[calc(100vh-var(--header-height))] pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url="/" />

      {draft && <LivePreviewListener />}

      {/* Hero section - critical above-the-fold content */}
      <Suspense fallback={<OptimizedLoader />}>
        <RenderHero {...hero} />
      </Suspense>

      {/* Blocks - lazy loaded for better performance */}
      <Suspense fallback={<div className="h-32 animate-pulse bg-muted/20 rounded-lg mx-4" />}>
        <RenderBlocks blocks={layout || []} />
      </Suspense>
    </article>
  )
}

// Generate metadata for the root page
export async function generateMetadata() {
  const payload = await getPayload({ config: configPromise })
  const page = await payload
    .find({
      collection: 'pages',
      where: {
        slug: {
          equals: 'home',
        },
      },
      locale: DEFAULT_LOCALE,
    })
    .then((result) => result.docs[0])

  return {
    title: page?.meta?.title || 'Home',
    description: page?.meta?.description,
  }
}
