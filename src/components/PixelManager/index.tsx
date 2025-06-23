'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Script from 'next/script'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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
  facebookSettings?: any
  ga4Settings?: any
  yandexSettings?: any
  customScript?: string
}

interface PixelManagerProps {
  currentPage?: string
  userConsent?: boolean
}

/**
 * Компонент для управления пикселями аналитики и рекламы
 * Автоматически загружает и инициализирует пиксели на основе настроек из админки
 */
export default function PixelManager({ 
  currentPage = 'all', 
  userConsent = true 
}: PixelManagerProps) {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPixels()
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
    // Проверяем активность
    if (!pixel.isActive) return false
    
    // Проверяем согласие пользователя для GDPR
    if (pixel.gdprCompliant && !userConsent) return false
    
    // Проверяем страницы
    if (pixel.pages.includes('all')) return true
    if (pixel.pages.includes(currentPage)) return true
    
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
                var o=t.getElementsByTagName("script")[0];
                o.parentNode.insertBefore(r,o)
              }(window,document,"https://vk.com/js/api/openapi.js?169","vk_callbacks");
            `
          }}
        />
        <noscript>
          <img
            src={`https://vk.com/rtrg?p=${pixel.pixelId}`}
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
              })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

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
              src={`https://mc.yandex.ru/watch/${pixel.pixelId}`}
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
