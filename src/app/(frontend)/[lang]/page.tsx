import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { LandingPage } from '@/components/LandingPage'
import type { Page, Media } from '@/payload-types'
import config from '@/payload.config'

export default async function LangPage({ params }: { params: { lang: string } }) {
  const lang = params.lang
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'home',
      },
    },
  })

  if (!docs.length) {
    return notFound()
  }

  const page = docs[0] as Page

  // Serialize the page data to remove any non-serializable properties
  const serializedPage = {
    id: page.id,
    title: page.title,
    hero: {
      type: page.hero.type,
      richText: page.hero.richText ? {
        root: {
          children: page.hero.richText.root.children.map(child => ({
            ...child,
            version: 1,
            format: child.format || '',
            indent: child.indent || 0,
            direction: child.direction || 'ltr',
          })),
          direction: page.hero.richText.root.direction || 'ltr',
          format: page.hero.richText.root.format || '',
          indent: page.hero.richText.root.indent || 0,
          type: 'root',
          version: 1,
        },
      } : null,
      media: page.hero.media ? {
        id: typeof page.hero.media === 'string' ? page.hero.media : (page.hero.media as Media).id,
        url: typeof page.hero.media === 'string' ? page.hero.media : (page.hero.media as Media).url || '',
      } : undefined,
      links: page.hero.links?.map(link => ({
        link: {
          type: link.link.type || 'custom',
          appearance: link.link.appearance || 'default',
          label: link.link.label,
          url: link.link.url || '',
        }
      })),
    },
    layout: page.layout?.map(block => {
      const { blockType, ...rest } = block as any
      return {
        ...rest,
        blockType,
      }
    }),
    meta: page.meta ? {
      title: page.meta.title || '',
      description: page.meta.description || '',
      image: page.meta.image ? {
        id: typeof page.meta.image === 'string' ? page.meta.image : (page.meta.image as Media).id,
        url: typeof page.meta.image === 'string' ? page.meta.image : (page.meta.image as Media).url || '',
      } : undefined,
    } : undefined,
  }

  return <LandingPage page={serializedPage} lang={lang} />
}
