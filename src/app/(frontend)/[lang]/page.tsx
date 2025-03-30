import React from 'react'
import { cn } from '@/utilities/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { homeStatic } from '@/endpoints/seed/home-static'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './[slug]/page.client'

type Props = {
  params: Promise<{ lang: string }>
}

export default async function LangHome({ params: paramsPromise }: Props) {
  const { lang } = await paramsPromise
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  let page = await payload
    .find({
      collection: 'pages',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      locale: lang,
      where: {
        slug: {
          equals: 'home',
        },
      },
    })
    .then((result) => result.docs[0])

  if (!page) {
    page = homeStatic
  }

  if (!page) {
    return notFound()
  }

  const { hero, layout } = page

  return (
    <article className="min-h-[calc(100vh-var(--header-height))] pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={`/${lang}`} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const { lang } = await paramsPromise
  const payload = await getPayload({ config })
  const { isEnabled: draft } = await draftMode()

  const page = await payload
    .find({
      collection: 'pages',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      locale: lang,
      where: {
        slug: {
          equals: 'home',
        },
      },
    })
    .then((result) => result.docs[0])

  return generateMeta({ doc: page })
}
