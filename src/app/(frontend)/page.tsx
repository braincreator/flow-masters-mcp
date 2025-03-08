import { redirect } from 'next/navigation'
import { generateMetadata as baseGenerateMetadata } from './[lang]/[slug]/page'

// Redirect to default language (English)
export default async function Page() {
  redirect('/en/home')
}

// Generate metadata for the root page
export async function generateMetadata() {
  return baseGenerateMetadata({ params: Promise.resolve({ lang: 'en', slug: 'home' }) })
}
