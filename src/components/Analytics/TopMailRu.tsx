'use client'

import React, { useEffect, useState } from 'react'
import Script from 'next/script'

interface TopMailRuProps {
  counterId: string
  debug?: boolean
}

declare global {
  interface Window {
    _tmr?: any[]
  }
}

export default function TopMailRu({ counterId, debug = false }: TopMailRuProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Инициализация Top.Mail.Ru
  const initTopMailRu = () => {
    if (typeof window !== 'undefined') {
      // Инициализируем _tmr массив если его нет
      window._tmr = window._tmr || []
      
      // Отправляем событие pageView
      window._tmr.push({
        id: counterId, 
        type: "pageView", 
        start: (new Date()).getTime()
      })

      if (debug && process.env.NODE_ENV === 'development') {
        console.log('✅ Top.Mail.Ru initialized successfully with ID:', counterId)
      }
      setIsLoaded(true)
    }
  }

  // Обработка успешной загрузки
  const handleLoad = () => {
    initTopMailRu()
    setLoadError(false)
  }

  // Обработка ошибки загрузки
  const handleError = () => {
    if (debug && process.env.NODE_ENV === 'development') {
      console.warn('❌ Failed to load Top.Mail.Ru script')
    }
    setLoadError(true)
    
    // Fallback инициализация
    initTopMailRu()
  }

  // Инициализируем сразу при монтировании
  useEffect(() => {
    initTopMailRu()
  }, [counterId])

  // Noscript fallback
  const noscriptContent = `
    <div>
      <img src="https://top-fwz1.mail.ru/counter?id=${counterId};js=na" 
           style="position:absolute;left:-9999px;" 
           alt="Top.Mail.Ru" />
    </div>
  `

  // Inline script для инициализации
  const inlineScript = `
    var _tmr = window._tmr || (window._tmr = []);
    _tmr.push({id: "${counterId}", type: "pageView", start: (new Date()).getTime()});
    (function (d, w, id) {
      if (d.getElementById(id)) return;
      var ts = d.createElement("script"); 
      ts.type = "text/javascript"; 
      ts.async = true; 
      ts.id = id;
      ts.src = "https://top-fwz1.mail.ru/js/code.js";
      var f = function () {
        var s = d.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(ts, s);
      };
      if (w.opera == "[object Opera]") { 
        d.addEventListener("DOMContentLoaded", f, false); 
      } else { 
        f(); 
      }
    })(document, window, "tmr-code");
  `

  return (
    <>
      {/* Inline script для быстрой инициализации */}
      <Script
        id={`top-mailru-${counterId}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: inlineScript }}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {debug && isLoaded && (
        <div style={{ 
          position: 'fixed', 
          top: '90px', 
          right: '10px', 
          background: '#ff9800', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          📧 Top.Mail.Ru: Active
        </div>
      )}

      {debug && loadError && (
        <div style={{ 
          position: 'fixed', 
          top: '90px', 
          right: '10px', 
          background: '#f44336', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          📧 Top.Mail.Ru: Error
        </div>
      )}
      
      <noscript dangerouslySetInnerHTML={{ __html: noscriptContent }} />
    </>
  )
}

// Хук для использования Top.Mail.Ru в компонентах
export function useTopMailRu(counterId: string) {
  const trackEvent = (type: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window._tmr) {
      window._tmr.push({
        id: counterId,
        type: type,
        ...params
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Top.Mail.Ru event tracked:', type, params)
      }
    }
  }

  const trackGoal = (goal: string, value?: number) => {
    trackEvent('reachGoal', { goal, value })
  }

  return {
    trackEvent,
    trackGoal
  }
}
