import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{
      service: string
      test: string
      status: 'success' | 'error' | 'warning'
      message: string
      url?: string
      responseTime?: number
    }>
  }

  // Test Yandex Metrica proxy
  try {
    const startTime = Date.now()
    const metrikaResponse = await fetch('https://mc.webvisor.org/metrika/tag_ww.js', {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Analytics-Test/1.0)'
      }
    })
    const responseTime = Date.now() - startTime
    
    results.tests.push({
      service: 'Yandex Metrica',
      test: 'Direct mc.webvisor.org access',
      status: metrikaResponse.ok ? 'success' : 'error',
      message: metrikaResponse.ok 
        ? `Script accessible (${metrikaResponse.status})` 
        : `Failed to access script (${metrikaResponse.status})`,
      url: 'https://mc.webvisor.org/metrika/tag_ww.js',
      responseTime
    })
  } catch (error) {
    results.tests.push({
      service: 'Yandex Metrica',
      test: 'Direct mc.webvisor.org access',
      status: 'error',
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: 'https://mc.webvisor.org/metrika/tag_ww.js'
    })
  }

  // Test VK.com proxy
  try {
    const startTime = Date.now()
    const vkResponse = await fetch('https://vk.com/js/api/openapi.js', {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Analytics-Test/1.0)'
      }
    })
    const responseTime = Date.now() - startTime

    results.tests.push({
      service: 'VK Pixel',
      test: 'Direct vk.com access',
      status: vkResponse.ok ? 'success' : 'error',
      message: vkResponse.ok
        ? `Script accessible (${vkResponse.status})`
        : `Failed to access script (${vkResponse.status})`,
      url: 'https://vk.com/js/api/openapi.js',
      responseTime
    })
  } catch (error) {
    results.tests.push({
      service: 'VK Pixel',
      test: 'Direct vk.com access',
      status: 'error',
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: 'https://vk.com/js/api/openapi.js'
    })
  }

  // Test VK Ads (ads.vk.com)
  try {
    const startTime = Date.now()
    const vkAdsResponse = await fetch('https://ads.vk.com/', {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Analytics-Test/1.0)'
      }
    })
    const responseTime = Date.now() - startTime

    results.tests.push({
      service: 'VK Ads',
      test: 'Direct ads.vk.com access',
      status: vkAdsResponse.ok ? 'success' : 'error',
      message: vkAdsResponse.ok
        ? `Domain accessible (${vkAdsResponse.status})`
        : `Failed to access domain (${vkAdsResponse.status})`,
      url: 'https://ads.vk.com/',
      responseTime
    })
  } catch (error) {
    results.tests.push({
      service: 'VK Ads',
      test: 'Direct ads.vk.com access',
      status: 'error',
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: 'https://ads.vk.com/'
    })
  }

  // Test local proxy endpoints
  const baseUrl = request.nextUrl.origin

  // Test Yandex Metrica proxy
  try {
    const startTime = Date.now()
    const proxyResponse = await fetch(`${baseUrl}/metrika/tag_ww.js`, {
      method: 'HEAD'
    })
    const responseTime = Date.now() - startTime
    
    results.tests.push({
      service: 'Yandex Metrica',
      test: 'Local proxy access',
      status: proxyResponse.ok ? 'success' : 'error',
      message: proxyResponse.ok 
        ? `Proxy working (${proxyResponse.status})` 
        : `Proxy failed (${proxyResponse.status})`,
      url: `${baseUrl}/metrika/tag_ww.js`,
      responseTime
    })
  } catch (error) {
    results.tests.push({
      service: 'Yandex Metrica',
      test: 'Local proxy access',
      status: 'error',
      message: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: `${baseUrl}/metrika/tag_ww.js`
    })
  }

  // Test VK Pixel proxy
  try {
    const startTime = Date.now()
    const vkProxyResponse = await fetch(`${baseUrl}/vk-pixel/js/api/openapi.js`, {
      method: 'HEAD'
    })
    const responseTime = Date.now() - startTime

    results.tests.push({
      service: 'VK Pixel',
      test: 'Local proxy access',
      status: vkProxyResponse.ok ? 'success' : 'error',
      message: vkProxyResponse.ok
        ? `Proxy working (${vkProxyResponse.status})`
        : `Proxy failed (${vkProxyResponse.status})`,
      url: `${baseUrl}/vk-pixel/js/api/openapi.js`,
      responseTime
    })
  } catch (error) {
    results.tests.push({
      service: 'VK Pixel',
      test: 'Local proxy access',
      status: 'error',
      message: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: `${baseUrl}/vk-pixel/js/api/openapi.js`
    })
  }

  // Test VK Ads proxy
  try {
    const startTime = Date.now()
    const vkAdsProxyResponse = await fetch(`${baseUrl}/vk-ads/`, {
      method: 'HEAD'
    })
    const responseTime = Date.now() - startTime

    results.tests.push({
      service: 'VK Ads',
      test: 'Local proxy access',
      status: vkAdsProxyResponse.ok ? 'success' : 'error',
      message: vkAdsProxyResponse.ok
        ? `Proxy working (${vkAdsProxyResponse.status})`
        : `Proxy failed (${vkAdsProxyResponse.status})`,
      url: `${baseUrl}/vk-ads/`,
      responseTime
    })
  } catch (error) {
    results.tests.push({
      service: 'VK Ads',
      test: 'Local proxy access',
      status: 'error',
      message: `Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      url: `${baseUrl}/vk-ads/`
    })
  }

  // Summary
  const successCount = results.tests.filter(t => t.status === 'success').length
  const totalTests = results.tests.length
  
  return NextResponse.json({
    ...results,
    summary: {
      total: totalTests,
      success: successCount,
      failed: totalTests - successCount,
      successRate: `${Math.round((successCount / totalTests) * 100)}%`
    }
  })
}
