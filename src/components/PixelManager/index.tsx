'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Script from 'next/script'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'

// Enhanced script loading with retry mechanism
const loadScriptWithRetry = (src: string, retries = 2): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true

    let attempts = 0

    const tryLoad = () => {
      attempts++

      script.onload = () => {
        logDebug(`Script loaded successfully: ${src}`)
        resolve()
      }

      script.onerror = () => {
        if (attempts < retries) {
          logWarn(`Script failed to load (attempt ${attempts}/${retries}): ${src}`)
          setTimeout(tryLoad, 1000 * attempts) // Exponential backoff
        } else {
          logError(`Script failed to load after ${retries} attempts: ${src}`)
          reject(new Error(`Failed to load script: ${src}`))
        }
      }

      document.head.appendChild(script)
    }

    tryLoad()
  })
}

// Analytics health check function
const checkAnalyticsHealth = () => {
  const health = {
    yandexMetrica: false,
    vkPixel: false,
    timestamp: new Date().toISOString()
  }

  // Check Yandex Metrica
  if (typeof window !== 'undefined' && window.ym) {
    health.yandexMetrica = true
    logDebug('Yandex Metrica: ✅ Loaded and available')
  } else {
    logWarn('Yandex Metrica: ❌ Not loaded or not available')
  }

  // Check VK Pixel
  if (typeof window !== 'undefined' && (window as any).VK && (window as any).VK.Retargeting) {
    health.vkPixel = true
    logDebug('VK Pixel: ✅ Loaded and available')
  } else {
    logWarn('VK Pixel: ❌ Not loaded or not available')
  }

  return health
}
interface Pixel {
  id: string
  name: string
  type: string
  pixelId: string
  isActive: boolean
  placement: 'head' | 'body_start' | 'body_end'
  pages: string[]
  loadPriority: 'high' | 'normal' | 'low'
  loadAsync: boolean
  gdprCompliant: boolean
  vkSettings?: any
  vkAdsSettings?: any
  facebookSettings?: any
  ga4Settings?: any
  yandexSettings?: any
  customScript?: string
}

interface PixelManagerProps {
  currentPage?: string
  userConsent?: boolean
  forceLoad?: boolean // Принудительная загрузка всех пикселей
}

/**
 * Компонент для управления пикселями аналитики и рекламы
 * Автоматически загружает и инициализирует пиксели на основе настроек из админки
 */
export default function PixelManager({
  currentPage = 'all',
  userConsent = true,
  forceLoad = false
}: PixelManagerProps) {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPixels()

    // Run health check after pixels are loaded
    const healthCheckTimer = setTimeout(() => {
      const health = checkAnalyticsHealth()
      logInfo('Analytics Health Check:', health)
    }, 5000) // Check after 5 seconds

    return () => clearTimeout(healthCheckTimer)
  }, [loadPixels])

  // Мемоизируем фильтрованные пиксели для производительности
  const filteredPixels = useMemo(() => {
    return pixels.filter(shouldLoadPixel)
  }, [pixels, currentPage, userConsent])

  const loadPixels = useCallback(async () => {
    try {
      logDebug(`Loading pixels for page: ${currentPage}`)
      const response = await fetch(`/api/pixels/active?page=${currentPage}`)
      if (response.ok) {
        const data = await response.json()
        logDebug(`Loaded ${data.pixels?.length || 0} pixels:`, data.pixels)
        setPixels(data.pixels || [])
      } else {
        logWarn('Failed to load pixels:', response.statusText)
      }
    } catch (error) {
      logError('Failed to load pixels:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  const shouldLoadPixel = (pixel: Pixel): boolean => {
    // 🚀 ПРИНУДИТЕЛЬНЫЙ РЕЖИМ - игнорируем все ограничения
    const forceLoadPixels = process.env.NEXT_PUBLIC_FORCE_LOAD_PIXELS === 'true' || forceLoad

    if (forceLoadPixels) {
      logInfo(`🚀 FORCE MODE: Loading pixel ${pixel.name} (${pixel.type}) regardless of settings`)
      return true
    }

    // Обычная логика проверок
    // Проверяем активность
    if (!pixel.isActive) {
      logDebug(`❌ Pixel ${pixel.name} is inactive`)
      return false
    }

    // Проверяем согласие пользователя для GDPR
    if (pixel.gdprCompliant && !userConsent) {
      logDebug(`❌ Pixel ${pixel.name} requires GDPR consent but user consent is false`)
      return false
    }

    // Проверяем страницы
    if (pixel.pages.includes('all')) {
      logDebug(`✅ Pixel ${pixel.name} is set for all pages`)
      return true
    }
    if (pixel.pages.includes(currentPage)) {
      logDebug(`✅ Pixel ${pixel.name} is set for current page: ${currentPage}`)
      return true
    }

    logDebug(`❌ Pixel ${pixel.name} is not configured for current page: ${currentPage}`)
    return false
  }

  const getScriptStrategy = (priority: string) => {
    switch (priority) {
      case 'high': return 'beforeInteractive'
      case 'low': return 'lazyOnload'
      default: return 'afterInteractive'
    }
  }

  const renderVKPixel = (pixel: Pixel) => {
    const settings = pixel.vkSettings || {}

    return (
      <>
        <Script
          key={`vk-${pixel.id}`}
          id={`vk-pixel-${pixel.id}`}
          strategy={getScriptStrategy(pixel.loadPriority)}
          dangerouslySetInnerHTML={{
            __html: `
              !function(e,t,a,n,g){
                e[n]=e[n]||[],e[n].push(function(){
                  VK.Retargeting.Init("${pixel.pixelId}");
                  ${settings.trackPageView !== false ? 'VK.Goal("page_view");' : ''}
                });
                var r=t.createElement("script");
                r.type="text/javascript",r.async=!0,r.src=a;
                r.onerror = function() {
                  console.warn('VK Pixel: Script failed to load from proxy, trying direct fallback');
                  // Try direct VK domain as fallback (may still be blocked)
                  var fallback = t.createElement("script");
                  fallback.type="text/javascript";
                  fallback.async=!0;
                  fallback.src="https://vk.com/js/api/openapi.js?169";
                  o.parentNode.insertBefore(fallback,o);
                };
                var o=t.getElementsByTagName("script")[0];
                o.parentNode.insertBefore(r,o)
              }(window,document,"/vk-pixel/js/api/openapi.js?169","vk_callbacks");
            `
          }}
        />
        <noscript>
          <img
            src={`/vk-pixel/rtrg?p=${pixel.pixelId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </noscript>
      </>
    )
  }

  const renderVKAdsPixel = (pixel: Pixel) => {
    const settings = pixel.vkAdsSettings || {}

    return (
      <>
        <Script
          key={`vk-ads-${pixel.id}`}
          id={`vk-ads-pixel-${pixel.id}`}
          strategy={getScriptStrategy(pixel.loadPriority)}
          dangerouslySetInnerHTML={{
            __html: `
              (function(d, w) {
                var n = d.getElementsByTagName("script")[0],
                s = d.createElement("script"),
                f = function () { n.parentNode.insertBefore(s, n); };
                s.type = "text/javascript";
                s.async = true;
                s.src = "/vk-ads/web-pixel/${pixel.pixelId}";
                s.onerror = function() {
                  console.warn('VK Ads: Script failed to load from proxy, trying direct fallback');
                  var fallback = d.createElement("script");
                  fallback.type = "text/javascript";
                  fallback.async = true;
                  fallback.src = "https://ads.vk.com/web-pixel/${pixel.pixelId}";
                  n.parentNode.insertBefore(fallback, n);
                };
                if (w.opera == "[object Opera]") {
                  d.addEventListener("DOMContentLoaded", f, false);
                } else { f(); }
              })(document, window);
            `
          }}
        />
        <noscript>
          <img
            src={`/vk-ads/web-pixel/${pixel.pixelId}?noscript=1`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </noscript>
      </>
    )
  }

  const renderFacebookPixel = (pixel: Pixel) => {
    const settings = pixel.facebookSettings || {}
    
    return (
      <>
        <Script
          key={`fb-${pixel.id}`}
          id={`facebook-pixel-${pixel.id}`}
          strategy={getScriptStrategy(pixel.loadPriority)}
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixel.pixelId}');
              ${settings.trackPageView ? `fbq('track', 'PageView');` : ''}
            `
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${pixel.pixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </>
    )
  }

  const renderGA4Pixel = (pixel: Pixel) => {
    const settings = pixel.ga4Settings || {}
    const measurementId = settings.measurementId || pixel.pixelId
    
    return (
      <>
        <Script
          key={`ga4-${pixel.id}`}
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy={getScriptStrategy(pixel.loadPriority)}
        />
        <Script
          id={`ga4-config-${pixel.id}`}
          strategy={getScriptStrategy(pixel.loadPriority)}
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}', {
                ${settings.enhancedEcommerce ? `send_page_view: true,` : ''}
                ${settings.customDimensions ? 
                  settings.customDimensions.map((dim: any) => 
                    `custom_map.${dim.name}: '${dim.value}'`
                  ).join(',') : ''
                }
              });
            `
          }}
        />
      </>
    )
  }

  const renderYandexPixel = (pixel: Pixel) => {
    const settings = pixel.yandexSettings || {}

    return (
      <>
        <Script
          key={`ym-${pixel.id}`}
          id={`yandex-metrica-${pixel.id}`}
          strategy={getScriptStrategy(pixel.loadPriority)}
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                k=e.createElement(t),
                a=e.getElementsByTagName(t)[0],
                k.async=1,
                k.src=r,
                a.parentNode.insertBefore(k,a)
                // Add error handling and fallback
                k.onerror = function() {
                  console.warn('Yandex Metrica: Primary script failed, trying fallback');
                  var fallback = e.createElement(t);
                  fallback.async = 1;
                  fallback.src = "/metrika/tag_ww.js";
                  a.parentNode.insertBefore(fallback, a);
                };
              })(window, document, "script", "/metrika/tag_ww.js", "ym");

              ym(${pixel.pixelId}, "init", {
                clickmap: ${settings.clickmap !== false},
                trackLinks: ${settings.trackLinks !== false},
                accurateTrackBounce: ${settings.accurateTrackBounce !== false},
                webvisor: ${settings.webvisor === true},
                ecommerce: ${settings.ecommerce === true ? '"dataLayer"' : 'false'}
              });
            `
          }}
        />
        <noscript>
          <div>
            <img
              src={`/metrika/watch/${pixel.pixelId}`}
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
      </>
    )
  }

  const renderTikTokPixel = (pixel: Pixel) => {
    return (
      <Script
        key={`tt-${pixel.id}`}
        id={`tiktok-pixel-${pixel.id}`}
        strategy={getScriptStrategy(pixel.loadPriority)}
        dangerouslySetInnerHTML={{
          __html: `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${pixel.pixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `
        }}
      />
    )
  }

  const renderCustomPixel = (pixel: Pixel) => {
    if (!pixel.customScript) return null
    
    return (
      <Script
        key={`custom-${pixel.id}`}
        id={`custom-pixel-${pixel.id}`}
        strategy={getScriptStrategy(pixel.loadPriority)}
        dangerouslySetInnerHTML={{
          __html: pixel.customScript
        }}
      />
    )
  }

  const renderPixel = (pixel: Pixel) => {
    if (!shouldLoadPixel(pixel)) {
      logDebug(`Pixel ${pixel.name} (${pixel.type}) skipped - shouldLoadPixel returned false`)
      return null
    }

    logDebug(`Rendering pixel: ${pixel.name} (${pixel.type}) with ID: ${pixel.pixelId}`)

    switch (pixel.type) {
      case 'vk':
        return renderVKPixel(pixel)
      case 'vk_ads':
        return renderVKAdsPixel(pixel)
      case 'facebook':
        return renderFacebookPixel(pixel)
      case 'ga4':
        return renderGA4Pixel(pixel)
      case 'yandex_metrica':
        return renderYandexPixel(pixel)
      case 'tiktok':
        return renderTikTokPixel(pixel)
      case 'custom':
        return renderCustomPixel(pixel)
      default:
        logWarn(`Unsupported pixel type: ${pixel.type}`)
        return null
    }
  }

  if (loading) {
    return null // Или показать загрузку
  }

  return (
    <>
      {filteredPixels.map(renderPixel)}
    </>
  )
}
