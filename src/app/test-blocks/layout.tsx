import { Metadata } from 'next'
import { DEFAULT_LOCALE } from '@/constants'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: 'common' })
  
  return {
    title: 'Test Blocks',
    description: 'Testing page for content blocks',
  }
}

export default function TestBlocksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="test-blocks-layout">
      {children}
    </div>
  )
}
