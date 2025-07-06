import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Flow Masters - AI-powered business automation solutions. Transform your workflows with intelligent automation, chatbots, and custom AI services.',
  images: [
    {
      url: `${getServerSideURL()}/og-image.jpg`,
    },
  ],
  siteName: 'Flow Masters',
  title: 'Flow Masters - AI Business Automation',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
