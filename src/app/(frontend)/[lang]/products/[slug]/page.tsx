import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from '@/utilities/payload'
import { ProductDetail } from '@/components/ProductDetail'
import { generateMeta } from '@/utilities/generateMeta'

interface Props {
  params: {
    slug: string
    lang: string
  }
}

export default async function ProductPage({ params: { slug, lang } }: Props) {
  const payload = await getPayload()
  
  const product = await payload.find({
    collection: 'products',
    where: {
      slug: {
        equals: slug,
      },
    },
    locale: lang,
  }).then(result => result.docs[0])

  if (!product) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </div>
  )
}

export async function generateMetadata({ params: { slug, lang } }: Props): Promise<Metadata> {
  const payload = await getPayload()
  
  const product = await payload.find({
    collection: 'products',
    where: {
      slug: {
        equals: slug,
      },
    },
    locale: lang,
  }).then(result => result.docs[0])

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return generateMeta({
    title: product.title,
    description: product.description,
    image: product.thumbnail?.url,
  })
}