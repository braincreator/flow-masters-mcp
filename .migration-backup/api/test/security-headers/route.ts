import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: {} as Record<string, string>,
    securityAnalysis: {
      csp: {
        present: false,
        analyticsSupport: {
          yandexMetrika: false,
          vkPixel: false,
          vkAds: false,
          googleAnalytics: false,
        },
        issues: [] as string[]
      },
      contentType: {
        present: false,
        value: '',
        impact: ''
      },
      frameOptions: {
        present: false,
        value: '',
        impact: ''
      },
      referrerPolicy: {
        present: false,
        value: '',
        impact: ''
      }
    },
    recommendations: [] as string[]
  }

  // Capture all response headers that would be sent
  const testResponse = new NextResponse('test')
  
  // Get headers from the current request
  const requestHeaders = Object.fromEntries(request.headers.entries())
  results.headers = requestHeaders

  // Test CSP header
  const cspHeader = request.headers.get('content-security-policy') || 
                   testResponse.headers.get('content-security-policy')
  
  if (cspHeader) {
    results.securityAnalysis.csp.present = true
    
    // Check analytics support
    results.securityAnalysis.csp.analyticsSupport.yandexMetrika = 
      cspHeader.includes('mc.yandex.ru') || cspHeader.includes('mc.webvisor.org')
    
    results.securityAnalysis.csp.analyticsSupport.vkPixel = 
      cspHeader.includes('vk.com')
    
    results.securityAnalysis.csp.analyticsSupport.vkAds = 
      cspHeader.includes('ads.vk.com')
    
    results.securityAnalysis.csp.analyticsSupport.googleAnalytics = 
      cspHeader.includes('google-analytics.com') || cspHeader.includes('googletagmanager.com')

    // Check for common issues
    if (!cspHeader.includes("'unsafe-inline'") && cspHeader.includes('script-src')) {
      results.securityAnalysis.csp.issues.push('Inline scripts blocked - may prevent analytics initialization')
    }
    
    if (!cspHeader.includes('data:') && cspHeader.includes('img-src')) {
      results.securityAnalysis.csp.issues.push('Data URLs blocked - may prevent tracking pixels')
    }
  } else {
    results.recommendations.push('Add Content-Security-Policy header for better security')
  }

  // Test X-Content-Type-Options
  const contentTypeHeader = request.headers.get('x-content-type-options')
  if (contentTypeHeader) {
    results.securityAnalysis.contentType.present = true
    results.securityAnalysis.contentType.value = contentTypeHeader
    
    if (contentTypeHeader === 'nosniff') {
      results.securityAnalysis.contentType.impact = 
        'Good for security. Ensure analytics scripts have correct Content-Type headers.'
    }
  }

  // Test X-Frame-Options
  const frameOptionsHeader = request.headers.get('x-frame-options')
  if (frameOptionsHeader) {
    results.securityAnalysis.frameOptions.present = true
    results.securityAnalysis.frameOptions.value = frameOptionsHeader
    
    if (frameOptionsHeader === 'DENY') {
      results.securityAnalysis.frameOptions.impact = 
        'Blocks all iframe embedding. May prevent some analytics widgets.'
    }
  }

  // Test Referrer-Policy
  const referrerPolicyHeader = request.headers.get('referrer-policy')
  if (referrerPolicyHeader) {
    results.securityAnalysis.referrerPolicy.present = true
    results.securityAnalysis.referrerPolicy.value = referrerPolicyHeader
    
    if (referrerPolicyHeader.includes('no-referrer')) {
      results.securityAnalysis.referrerPolicy.impact = 
        'May limit analytics referrer data collection.'
    }
  }

  // Generate recommendations
  if (!results.securityAnalysis.csp.analyticsSupport.yandexMetrika) {
    results.recommendations.push('Add Yandex Metrika domains to CSP: mc.yandex.ru, mc.webvisor.org')
  }
  
  if (!results.securityAnalysis.csp.analyticsSupport.vkAds) {
    results.recommendations.push('Add VK Ads domain to CSP: ads.vk.com')
  }

  // Test actual script loading
  const scriptTests = await testScriptLoading(request.nextUrl.origin)
  
  return NextResponse.json({
    ...results,
    scriptLoadingTests: scriptTests,
    summary: {
      securityLevel: calculateSecurityLevel(results),
      analyticsCompatibility: calculateAnalyticsCompatibility(results),
      criticalIssues: results.securityAnalysis.csp.issues.length
    }
  })
}

async function testScriptLoading(origin: string) {
  const tests = [
    {
      name: 'Yandex Metrika Script',
      url: `${origin}/metrika/tag_ww.js`,
      expected: 'application/javascript'
    },
    {
      name: 'VK Pixel Script',
      url: `${origin}/vk-pixel/js/api/openapi.js`,
      expected: 'application/javascript'
    },
    {
      name: 'VK Ads Script',
      url: `${origin}/vk-ads/web-pixel/test`,
      expected: 'application/javascript'
    }
  ]

  const results = []
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url, { method: 'HEAD' })
      const contentType = response.headers.get('content-type') || 'unknown'
      
      results.push({
        ...test,
        status: response.status,
        contentType,
        success: response.ok && contentType.includes('javascript'),
        error: null
      })
    } catch (error) {
      results.push({
        ...test,
        status: 0,
        contentType: 'unknown',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return results
}

function calculateSecurityLevel(results: any): 'high' | 'medium' | 'low' {
  let score = 0
  
  if (results.securityAnalysis.csp.present) score += 3
  if (results.securityAnalysis.contentType.present) score += 2
  if (results.securityAnalysis.frameOptions.present) score += 2
  if (results.securityAnalysis.referrerPolicy.present) score += 1
  
  if (score >= 7) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

function calculateAnalyticsCompatibility(results: any): 'good' | 'partial' | 'poor' {
  const support = results.securityAnalysis.csp.analyticsSupport
  const supportCount = Object.values(support).filter(Boolean).length
  
  if (supportCount >= 3) return 'good'
  if (supportCount >= 1) return 'partial'
  return 'poor'
}
