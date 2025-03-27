import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload'
import { ProductDetail } from '@/components/ProductDetail'
import { RelatedProducts } from '@/components/RelatedProducts'
import { generateMeta } from '@/utilities/generateMeta'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

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

  const serverUrl = getServerSideURL()
  const productUrl = `${serverUrl}/${lang}/products/${slug}`

  const title =
    typeof product.title === 'object' ? product.title[lang] || product.title.en : product.title

  const description = product.shortDescription
    ? typeof product.shortDescription === 'object'
      ? product.shortDescription[lang] || product.shortDescription.en
      : product.shortDescription
    : typeof product.description === 'string'
      ? product.description.slice(0, 160)
      : 'Check out this product'

  const imageUrl =
    product.featuredImage?.url ||
    (product.gallery && product.gallery.length > 0
      ? typeof product.gallery[0].image === 'string'
        ? product.gallery[0].image
        : product.gallery[0].image?.url
      : typeof product.thumbnail === 'string'
        ? product.thumbnail
        : product.thumbnail?.url)

  const fullImageUrl = imageUrl
    ? imageUrl.startsWith('http')
      ? imageUrl
      : `${serverUrl}${imageUrl}`
    : `${serverUrl}/website-template-OG.webp`

  return {
    title: title,
    description: description,
    openGraph: {
      type: 'website',
      title: title,
      description: description,
      url: productUrl,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: lang,
      siteName: 'Flow Masters',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [fullImageUrl],
    },
  }
}
