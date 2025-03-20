import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ReactNode } from 'react'
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'
import { AdminBar } from '@/components/AdminBar'
import { draftMode } from 'next/headers'
import { getSiteConfig } from '@/utilities/get-site-config'
import { cn } from '@/utilities/ui'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { generateThemeVariables } from '@/utilities/theme'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Script from 'next/script'

const locales = ['en', 'ru']

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Flow Masters',
  description: 'Flow Masters - Your Business Process Automation Partner',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}

interface LayoutProps {
  children: ReactNode
  params: {
    lang: string
  }
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = params
  const { isEnabled } = await draftMode()
  const siteConfig = await getSiteConfig()
  const themeVariables = generateThemeVariables(siteConfig?.branding)
  
  if (!locales.includes(lang)) {
    return notFound()
  }

  return (
    <html 
      className={cn(GeistSans.variable, GeistMono.variable)} 
      lang={lang} 
      suppressHydrationWarning
      style={{ ...themeVariables }}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Google Analytics */}
        {siteConfig?.analytics?.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics.googleAnalyticsId}`}
              strategy="afterInteractive"
              async
            />
            <Script id="ga-init" strategy="afterInteractive" async>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${siteConfig.analytics.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}

        {/* Meta Pixel */}
        {siteConfig?.analytics?.metaPixelId && (
          <>
            <Script
              src="https://connect.facebook.net/en_US/fbevents.js"
              strategy="afterInteractive"
              async
            />
            <Script id="fb-pixel-init" strategy="afterInteractive" async>
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                s=b.getElementsByTagName(e)[0];
                }(window, document,'script');
                fbq('init', '${siteConfig.analytics.metaPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <div id="root">
          {isEnabled && <AdminBar adminBarProps={{ preview: isEnabled }} />}
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
