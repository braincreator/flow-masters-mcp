import { getPayload } from 'payload'
import configPromise from '../src/payload.config.ts'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
})

// Generate a temporary secret if not provided
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET || 'temporary-secret-for-script-execution'

async function fillSiteConfig() {
  let payload;
  
  try {
    console.log('Initializing Payload...')
    const config = await configPromise
    
    payload = await getPayload({
      // Merge the config with explicit secret
      config: {
        ...config,
        secret: PAYLOAD_SECRET
      },
      local: true
    })

    console.log('Updating site configuration...')
    const siteConfig = await payload.updateGlobal({
      slug: 'site-config',
      data: {
        title: 'Flow Masters',
        description: 'Your Business Process Automation Partner',
        company: {
          legalName: 'Flow Masters LLC',
          foundedYear: 2023,
          taxId: '12-3456789',
          registrationNumber: 'REG123456',
          vatNumber: 'VAT123456',
        },
        contact: {
          email: 'contact@flowmasters.example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Avenue\nTech District\nSan Francisco, CA 94105',
          workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM EST',
          googleMapsUrl: 'https://goo.gl/maps/example',
        },
        branding: {
          colors: {
            primary: '#2563eb',
            secondary: '#1e293b',
            accent: '#3b82f6',
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Georgia',
          },
        },
        seo: {
          defaultMetaTitle: 'Flow Masters - Business Process Automation',
          defaultMetaDescription: 'Transform your business operations with AI-powered automation solutions from Flow Masters.',
          robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/',
          jsonLd: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Flow Masters",
            "description": "Business Process Automation Solutions",
            "url": "https://flowmasters.example.com",
            "foundingDate": "2023",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Business Avenue",
              "addressLocality": "San Francisco",
              "addressRegion": "CA",
              "postalCode": "94105",
              "addressCountry": "US"
            }
          }, null, 2)
        },
        analytics: {
          googleAnalyticsId: '',
          googleTagManagerId: '',
          metaPixelId: '',
        },
        features: {
          blog: {
            enabled: true,
            postsPerPage: 12,
            enableComments: true,
            moderateComments: true,
          },
          newsletter: {
            enabled: true,
            provider: 'mailchimp',
            apiKey: '',
          },
          search: {
            enabled: true,
            provider: 'algolia',
            apiKey: '',
          },
        },
        performance: {
          cache: {
            enabled: true,
            ttl: 3600,
          },
          images: {
            optimization: 'balanced',
            lazyLoading: true,
            placeholders: 'blur',
          },
        },
      },
    })

    console.log('✅ Site configuration updated successfully!')
    console.log(JSON.stringify(siteConfig, null, 2))
    
    await payload.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error details:', error)
    
    if (payload) {
      await payload.disconnect()
    }
    
    process.exit(1)
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error)
  process.exit(1)
})

fillSiteConfig()
