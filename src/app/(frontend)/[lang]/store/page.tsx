import { getPayloadClient } from '@/utilities/payload'
import { ProductGrid } from '@/components/ProductGrid'
import { Metadata } from 'next'

export default async function StorePage() {
  const payload = await getPayloadClient()
  
  const products = await payload.find({
    collection: 'products',
    where: {
      status: {
        equals: 'published',
      },
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Digital Products Store</h1>
      <ProductGrid products={products.docs} />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Digital Store - AI Automation Solutions',
    description: 'Purchase N8N workflows, Make.com automations, tutorials, and courses',
  }
}