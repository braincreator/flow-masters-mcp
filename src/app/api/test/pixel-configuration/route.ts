import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    configurationIssues: [] as any[],
    pixelSettings: {
      totalPixels: 0,
      activePixels: 0,
      inactivePixels: 0,
      gdprCompliantPixels: 0,
      pageSpecificPixels: 0
    },
    consentSettings: {
      cookieConsentRequired: false,
      gdprEnabled: false,
      defaultConsentState: 'unknown'
    },
    featureFlags: {
      analyticsEnabled: false,
      debugMode: false,
      developmentMode: false
    },
    environmentChecks: {
      nodeEnv: process.env.NODE_ENV,
      analyticsIds: {
        yandexMetrika: !!process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
        vkPixel: !!process.env.NEXT_PUBLIC_VK_PIXEL_ID,
        googleAnalytics: !!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
      }
    },
    recommendations: [] as string[]
  }

  try {
    // Check Payload CMS pixel configuration
    const payload = await getPayloadClient()
    
    try {
      const pixelsResponse = await payload.find({
        collection: 'pixels',
        limit: 100
      })

      const pixels = pixelsResponse.docs || []
      results.pixelSettings.totalPixels = pixels.length
      results.pixelSettings.activePixels = pixels.filter((p: any) => p.isActive).length
      results.pixelSettings.inactivePixels = pixels.filter((p: any) => !p.isActive).length
      results.pixelSettings.gdprCompliantPixels = pixels.filter((p: any) => p.gdprCompliant).length
      results.pixelSettings.pageSpecificPixels = pixels.filter((p: any) => 
        p.pages && p.pages.length > 0 && !p.pages.includes('all')
      ).length

      // Check for configuration issues
      pixels.forEach((pixel: any) => {
        const issues = []

        // Check if pixel is inactive
        if (!pixel.isActive) {
          issues.push('Pixel is marked as inactive')
        }

        // Check for missing pixel ID
        if (!pixel.pixelId || pixel.pixelId.trim() === '') {
          issues.push('Missing pixel ID')
        }

        // Check for invalid pixel ID format
        if (pixel.pixelId) {
          const validationResult = validatePixelId(pixel.type, pixel.pixelId)
          if (!validationResult.valid) {
            issues.push(`Invalid pixel ID format: ${validationResult.message}`)
          }
        }

        // Check for GDPR compliance issues
        if (pixel.gdprCompliant && !pixel.pages.includes('all')) {
          issues.push('GDPR compliant pixel with page restrictions may not load on consent pages')
        }

        // Check for page targeting issues
        if (pixel.pages.length === 0) {
          issues.push('No pages specified - pixel will not load anywhere')
        }

        if (issues.length > 0) {
          results.configurationIssues.push({
            pixelId: pixel.id,
            pixelName: pixel.name,
            pixelType: pixel.type,
            issues
          })
        }
      })

    } catch (error) {
      results.configurationIssues.push({
        category: 'Database',
        issue: 'Failed to fetch pixels from database',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Check environment variables
    const envIssues = []
    
    if (!process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) {
      envIssues.push('NEXT_PUBLIC_YANDEX_METRIKA_ID not set')
    }
    
    if (!process.env.NEXT_PUBLIC_VK_PIXEL_ID) {
      envIssues.push('NEXT_PUBLIC_VK_PIXEL_ID not set')
    }

    if (envIssues.length > 0) {
      results.configurationIssues.push({
        category: 'Environment Variables',
        issues: envIssues
      })
    }

    // Check feature flags
    results.featureFlags.analyticsEnabled = true // From app config
    results.featureFlags.debugMode = process.env.NODE_ENV === 'development'
    results.featureFlags.developmentMode = process.env.NODE_ENV === 'development'

    // Check consent configuration
    results.consentSettings.cookieConsentRequired = true // Based on GDPR implementation
    results.consentSettings.gdprEnabled = true
    results.consentSettings.defaultConsentState = 'denied' // Default state before user consent

    // Generate recommendations
    if (results.pixelSettings.activePixels === 0) {
      results.recommendations.push('No active pixels found. Enable pixels in admin panel.')
    }

    if (results.pixelSettings.gdprCompliantPixels > 0 && !results.consentSettings.gdprEnabled) {
      results.recommendations.push('GDPR compliant pixels found but GDPR system not properly configured.')
    }

    if (results.configurationIssues.length > 0) {
      results.recommendations.push('Configuration issues detected. Review pixel settings in admin panel.')
    }

    if (!results.environmentChecks.analyticsIds.yandexMetrika && 
        !results.environmentChecks.analyticsIds.vkPixel && 
        !results.environmentChecks.analyticsIds.googleAnalytics) {
      results.recommendations.push('No analytics IDs configured in environment variables.')
    }

    // Check for potential blocking scenarios
    const blockingScenarios = checkBlockingScenarios(results)
    if (blockingScenarios.length > 0) {
      results.configurationIssues.push({
        category: 'Potential Blocking Scenarios',
        issues: blockingScenarios
      })
    }

  } catch (error) {
    results.configurationIssues.push({
      category: 'System Error',
      issue: 'Failed to analyze configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  return NextResponse.json(results)
}

function validatePixelId(type: string, pixelId: string): { valid: boolean; message?: string } {
  const patterns = {
    yandex_metrica: /^\d{8,9}$/,
    vk: /^\d{6,10}$/,
    vk_ads: /^\d{6,10}$/,
    facebook: /^\d{15,16}$/,
    ga4: /^G-[A-Z0-9]{10}$/,
    google_ads: /^AW-\d{9,11}$/,
    tiktok: /^[A-Z0-9]{20}$/
  }

  const pattern = patterns[type as keyof typeof patterns]
  if (!pattern) {
    return { valid: true } // Unknown type, assume valid
  }

  const isValid = pattern.test(pixelId)
  return {
    valid: isValid,
    message: isValid ? undefined : `Expected format for ${type}: ${pattern.source}`
  }
}

function checkBlockingScenarios(results: any): string[] {
  const scenarios = []

  // GDPR blocking scenario
  if (results.pixelSettings.gdprCompliantPixels > 0) {
    scenarios.push('GDPR compliant pixels require user consent - may be blocked until consent given')
  }

  // Page targeting blocking
  if (results.pixelSettings.pageSpecificPixels > 0) {
    scenarios.push('Page-specific pixels may not load on non-targeted pages')
  }

  // Development mode blocking
  if (results.featureFlags.developmentMode) {
    scenarios.push('Development mode may have different analytics behavior')
  }

  // Missing environment variables
  const missingIds = Object.entries(results.environmentChecks.analyticsIds)
    .filter(([_, hasId]) => !hasId)
    .map(([service, _]) => service)

  if (missingIds.length > 0) {
    scenarios.push(`Missing analytics IDs for: ${missingIds.join(', ')}`)
  }

  return scenarios
}
