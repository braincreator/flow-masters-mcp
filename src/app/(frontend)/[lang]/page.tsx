import React from 'react'
import { cn } from '@/utilities/ui'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import { getPayloadClient } from '@/utilities/payload'
import { Page } from '@/payload-types'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

export default async function Home() {
  const locale = await getCurrentLocale()
  const payload = await getPayloadClient()

  const { docs: pages } = await payload.find({
    collection: 'pages',
    where: {
      'slug': {
        equals: 'home',
      },
    },
    locale,
  })

  const page = pages[0]

  if (!page) {
    return notFound()
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-gradient animate-fade-in mb-6">
              {page.title}
            </h1>
            <div className="prose prose-lg dark:prose-invert mb-8">
              <RichText content={page.content} />
            </div>
            {page.links && page.links.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {page.links.map((link, i) => (
                  <CMSLink
                    key={i}
                    {...link}
                    appearance={i === 0 ? 'primary' : 'ghost'}
                    size="lg"
                    className="glass-card px-6 py-3 font-medium"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {page.media && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full">
            <Media
              resource={page.media}
              className="object-cover w-full h-full opacity-80"
              fill
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          </div>
        )}
      </section>

      {/* Features Section */}
      {page.features && (
        <section className="py-24 bg-gradient-subtle">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {page.features.map((feature, i) => (
                <div
                  key={i}
                  className="card-hover p-6 flex flex-col gap-4"
                >
                  {feature.icon && (
                    <div className="text-primary text-4xl">
                      {feature.icon}
                    </div>
                  )}
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content Blocks */}
      {page.blocks?.map((block, i) => (
        <section
          key={i}
          className={cn(
            'py-24',
            i % 2 === 0 ? 'bg-background' : 'bg-gradient-subtle'
          )}
        >
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className={cn(i % 2 === 0 ? 'md:order-1' : 'md:order-2')}>
                {block.media && (
                  <div className="relative aspect-video rounded-xl overflow-hidden glass-card">
                    <Media
                      resource={block.media}
                      className="object-cover"
                      fill
                    />
                  </div>
                )}
              </div>
              <div className={cn(i % 2 === 0 ? 'md:order-2' : 'md:order-1')}>
                <h2 className="text-3xl font-bold mb-6">{block.title}</h2>
                <div className="prose dark:prose-invert mb-8">
                  <RichText content={block.content} />
                </div>
                {block.links && block.links.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {block.links.map((link, j) => (
                      <CMSLink
                        key={j}
                        {...link}
                        appearance={j === 0 ? 'primary' : 'ghost'}
                        className="interactive-element"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      {page.cta && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-ai-radial opacity-20" />
          <div className="container relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">{page.cta.title}</h2>
              <div className="prose dark:prose-invert mb-8 mx-auto">
                <RichText content={page.cta.content} />
              </div>
              {page.cta.links && page.cta.links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4">
                  {page.cta.links.map((link, i) => (
                    <CMSLink
                      key={i}
                      {...link}
                      appearance={i === 0 ? 'primary' : 'ghost'}
                      size="lg"
                      className="glass-card px-8 py-4 font-medium"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const payload = await getPayloadClient()

  const { docs: pages } = await payload.find({
    collection: 'pages',
    where: {
      'slug': {
        equals: 'home',
      },
    },
    locale,
  })

  const page = pages[0]

  return {
    title: page?.meta?.title || page?.title,
    description: page?.meta?.description,
    openGraph: {
      title: page?.meta?.title || page?.title,
      description: page?.meta?.description,
      images: page?.meta?.image ? [page.meta.image] : undefined,
    },
  }
}
