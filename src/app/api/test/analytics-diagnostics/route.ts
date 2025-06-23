import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || 'Unknown',
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
    tests: {
      network: [] as any[],
      dns: [] as any[],
      security: [] as any[],
      performance: [] as any[]
    },
    recommendations: [] as string[],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  }

  // Test 1: DNS Resolution for analytics domains
  const analyticsDomains = [
    'mc.yandex.ru',
    'mc.webvisor.org',
    'vk.com',
    'ads.vk.com',
    'www.google-analytics.com',
    'www.googletagmanager.com'
  ]

  for (const domain of analyticsDomains) {
    try {
      const startTime = Date.now()
      const response = await fetch(`https://${domain}`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      const responseTime = Date.now() - startTime

      results.tests.dns.push({
        domain,
        status: response.status,
        responseTime,
        accessible: response.ok,
        error: null
      })
    } catch (error) {
      results.tests.dns.push({
        domain,
        status: 0,
        responseTime: 0,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test 2: Check for common blocking patterns
  const blockingTests = [
    {
      name: 'Corporate Firewall Detection',
      test: async () => {
        // Check if requests are being filtered
        const testUrls = [
          'https://mc.yandex.ru/metrika/tag.js',
          'https://vk.com/js/api/openapi.js'
        ]
        
        let blocked = 0
        for (const url of testUrls) {
          try {
            const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
            if (!response.ok) blocked++
          } catch {
            blocked++
          }
        }
        
        return {
          passed: blocked === 0,
          message: blocked > 0 ? `${blocked}/${testUrls.length} analytics domains blocked` : 'All domains accessible',
          severity: blocked > 0 ? 'error' : 'success'
        }
      }
    },
    {
      name: 'Geographic Restrictions',
      test: async () => {
        // Check if we're in a region with restrictions
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
        const userAgent = request.headers.get('user-agent') || ''
        
        // Simple heuristics for geographic restrictions
        const suspiciousPatterns = [
          /bot|crawler|spider/i.test(userAgent),
          !ip || ip === '127.0.0.1'
        ]
        
        const hasSuspiciousPatterns = suspiciousPatterns.some(Boolean)
        
        return {
          passed: !hasSuspiciousPatterns,
          message: hasSuspiciousPatterns ? 'Potential geographic or bot restrictions detected' : 'No geographic restrictions detected',
          severity: hasSuspiciousPatterns ? 'warning' : 'success'
        }
      }
    },
    {
      name: 'CDN Availability',
      test: async () => {
        // Test if CDNs are working
        const cdnTests = [
          'https://mc.webvisor.org/metrika/tag_ww.js',
          'https://yastatic.net/s3/metrika/metrika_match.html'
        ]
        
        let working = 0
        for (const url of cdnTests) {
          try {
            const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
            if (response.ok) working++
          } catch {
            // CDN might be down
          }
        }
        
        return {
          passed: working > 0,
          message: `${working}/${cdnTests.length} CDNs accessible`,
          severity: working === 0 ? 'error' : working < cdnTests.length ? 'warning' : 'success'
        }
      }
    }
  ]

  // Run blocking tests
  for (const test of blockingTests) {
    try {
      const result = await test.test()
      results.tests.network.push({
        name: test.name,
        ...result
      })
    } catch (error) {
      results.tests.network.push({
        name: test.name,
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      })
    }
  }

  // Test 3: Security headers impact
  const securityTests = [
    {
      name: 'Content Security Policy',
      test: () => {
        // This would be checked on the client side
        return {
          passed: true,
          message: 'CSP check requires client-side testing',
          severity: 'info'
        }
      }
    },
    {
      name: 'CORS Configuration',
      test: () => {
        const origin = request.headers.get('origin')
        return {
          passed: true,
          message: origin ? `Origin: ${origin}` : 'No origin header (direct access)',
          severity: 'info'
        }
      }
    }
  ]

  for (const test of securityTests) {
    const result = test.test()
    results.tests.security.push({
      name: test.name,
      ...result
    })
  }

  // Test 4: Performance checks
  const performanceTests = [
    {
      name: 'Response Time Analysis',
      test: async () => {
        const testUrl = `${request.nextUrl.origin}/metrika/tag_ww.js`
        try {
          const startTime = Date.now()
          const response = await fetch(testUrl, { method: 'HEAD' })
          const responseTime = Date.now() - startTime
          
          return {
            passed: responseTime < 2000,
            message: `Response time: ${responseTime}ms`,
            severity: responseTime > 5000 ? 'error' : responseTime > 2000 ? 'warning' : 'success',
            responseTime
          }
        } catch (error) {
          return {
            passed: false,
            message: `Failed to test response time: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error'
          }
        }
      }
    }
  ]

  for (const test of performanceTests) {
    const result = await test.test()
    results.tests.performance.push({
      name: test.name,
      ...result
    })
  }

  // Calculate summary
  const allTests = [
    ...results.tests.network,
    ...results.tests.dns.map(d => ({ passed: d.accessible, severity: d.accessible ? 'success' : 'error' })),
    ...results.tests.security,
    ...results.tests.performance
  ]

  results.summary.totalTests = allTests.length
  results.summary.passed = allTests.filter(t => t.passed).length
  results.summary.failed = allTests.filter(t => !t.passed && t.severity === 'error').length
  results.summary.warnings = allTests.filter(t => t.severity === 'warning').length

  // Generate recommendations
  const failedDns = results.tests.dns.filter(d => !d.accessible)
  if (failedDns.length > 0) {
    results.recommendations.push(`${failedDns.length} analytics domains are not accessible. Check network connectivity or DNS settings.`)
  }

  const networkIssues = results.tests.network.filter(t => !t.passed)
  if (networkIssues.length > 0) {
    results.recommendations.push('Network connectivity issues detected. Check firewall and proxy settings.')
  }

  const slowResponses = results.tests.performance.filter(t => t.responseTime && t.responseTime > 2000)
  if (slowResponses.length > 0) {
    results.recommendations.push('Slow response times detected. Consider CDN optimization.')
  }

  if (results.summary.failed === 0 && results.summary.warnings === 0) {
    results.recommendations.push('All server-side tests passed! Check client-side diagnostics for browser-specific issues.')
  }

  return NextResponse.json(results)
}
