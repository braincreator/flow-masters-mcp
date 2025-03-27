import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload'
import { ProductDetail } from '@/components/ProductDetail'
import { RelatedProducts } from '@/components/RelatedProducts'
import { generateMeta } from '@/utilities/generateMeta'

interface Props {
  params: Promise<{
    slug: string
    lang: string
  }>
}

export default async function ProductPage({ params }: Props) {
  const { slug, lang } = await params
  const payload = await getPayloadClient()

  const product = await payload
    .find({
      collection: 'products',
      where: {
        slug: {
          equals: slug,
        },
      },
      locale: lang,
    })
    .then((result) => result.docs[0])

  if (!product) {
    return notFound()
  }

  return (
    <div className="py-10 px-4 md:px-6 lg:px-8">
      <ProductDetail product={product} lang={lang} />
      <div className="max-w-7xl mx-auto">
        <RelatedProducts product={product} lang={lang} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params
  const payload = await getPayloadClient()

  const product = await payload
    .find({
      collection: 'products',
      where: {
        slug: {
          equals: slug,
        },
      },
      locale: lang,
    })
    .then((result) => result.docs[0])

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
