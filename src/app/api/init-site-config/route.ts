import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST() {
  try {
    const payload = await getPayload({ config: await configPromise })
    
    // Check if config already exists
    const existingConfig = await payload.findGlobal({
      slug: 'site-config',
    }).catch(() => null)

    if (existingConfig) {
      return NextResponse.json(
        { success: false, error: 'Site configuration already exists' },
        { status: 409 }
      )
    }
    
    const siteConfig = await payload.updateGlobal({
      slug: 'site-config',
      data: {
        title: 'Flow Masters',
        description: 'Your Business Process Automation Partner',
        company: {
          legalName: 'Flow Masters LLC',
          foundedYear: 2023,
        },
        contact: {
          email: 'contact@example.com',
          phone: '+1 234 567 8900',
          address: '123 Business Street, Tech City, 12345',
          workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM',
        },
        localization: {
          defaultTimeZone: 'UTC',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24',
        },
        branding: {
          colors: {
            primary: '#8B31FF',    // A vibrant purple
            secondary: '#1F2937',   // A deep gray
            accent: '#7C3AED',     // A complementary purple
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Georgia',
          },
        },
        socialLinks: {
          twitter: 'https://twitter.com/flowmasters',
          linkedin: 'https://linkedin.com/company/flowmasters',
          facebook: 'https://facebook.com/flowmasters',
        },
        seo: {
          defaultMetaTitle: 'Flow Masters - Business Process Automation',
          defaultMetaDescription: 'Transform your business with AI-powered automation solutions.',
        },
        analytics: {
          googleAnalyticsId: '',
          googleTagManagerId: '',
          metaPixelId: '',
        },
        features: {
          blog: {
            enabled: true,
            postsPerPage: 10,
            enableComments: true,
            moderateComments: true,
          },
          images: {
            optimization: 'balanced',
            lazyLoading: true,
            placeholders: 'blur',
          },
        },
      },
    })

    if (!siteConfig) {
      throw new Error('Failed to create site configuration')
    }

    return NextResponse.json({ success: true, siteConfig })
  } catch (error) {
    console.error('Failed to initialize site config:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }
      if (error.message.includes('Permission')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize site configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
