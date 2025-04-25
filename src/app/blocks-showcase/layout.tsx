import { Metadata } from 'next'
import { DEFAULT_LOCALE } from '@/constants'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: 'common' })
  
  return {
    title: 'Blocks Showcase',
    description: 'Showcase of available content blocks',
  }
}

export default function BlocksShowcaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="blocks-showcase-layout">
      {children}
    </div>
  )
}
