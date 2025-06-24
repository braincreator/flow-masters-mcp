/**
 * Top.Mail.Ru (VK Ads) implementation for Next.js App Directory
 * Адаптация официального кода VK Ads для современного Next.js
 */

import { TopMailRuConfig, TopMailRuEvent, AnalyticsError } from './types'

export class TopMailRuService {
  private config: TopMailRuConfig
  private isInitialized = false
  private debug = false

  constructor(config: TopMailRuConfig, debug = false) {
    this.config = config
    this.debug = debug
  }

  /**
   * Initialize Top.Mail.Ru (VK Ads)
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !this.config.enabled) {
      return
    }

    try {
      await this.loadScript()
      this.initializeCounter()
      this.isInitialized = true
      
      if (this.debug) {
        console.log('[TopMailRu] Initialized successfully', {
          counterId: this.config.counterId
        })
      }
    } catch (error) {
      const analyticsError = new AnalyticsError(
        `Failed to initialize Top.Mail.Ru: ${error}`,
        'vk_pixel'
      )
      
      if (this.debug) {
        console.error('[TopMailRu] Initialization failed:', error)
      }
      
      throw analyticsError
    }
  }

  /**
   * Load Top.Mail.Ru script (адаптированный официальный код)
   */
  private async loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if _tmr is already available
      if ((window as any)._tmr) {
        resolve()
        return
      }

      // Check if script tag already exists
      const existingScript = document.getElementById('tmr-code')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', reject)
        return
      }

      // Initialize _tmr array before script loads
      ;(window as any)._tmr = (window as any)._tmr || []

      // Адаптированный код из официального скрипта VK Ads
      const loadTopMailRuScript = () => {
        const d = document
        const w = window
        const id = 'tmr-code'
        
        if (d.getElementById(id)) {
          resolve()
          return
        }
        
        const ts = d.createElement('script')
        ts.type = 'text/javascript'
        ts.async = true
        ts.id = id
        ts.src = 'https://top-fwz1.mail.ru/js/code.js'
        
        ts.onload = () => {
          if (this.debug) {
            console.log('[TopMailRu] Script loaded successfully')
          }
          resolve()
        }
        
        ts.onerror = () => {
          reject(new Error('Failed to load Top.Mail.Ru script'))
        }
        
        const insertScript = () => {
          const s = d.getElementsByTagName('script')[0]
          s.parentNode?.insertBefore(ts, s)
        }
        
        // Проверка на Opera (из оригинального кода)
        if ((w as any).opera === '[object Opera]') {
          d.addEventListener('DOMContentLoaded', insertScript, false)
        } else {
          insertScript()
        }
      }

      loadTopMailRuScript()
    })
  }

  /**
   * Initialize the counter
   */
  private initializeCounter(): void {
    if (!(window as any)._tmr) {
      throw new Error('Top.Mail.Ru script not loaded')
    }

    // Track initial page view if enabled
    if (this.config.trackPageView !== false) {
      this.pageView()
    }

    if (this.debug) {
      console.log('[TopMailRu] Counter initialized:', { counterId: this.config.counterId })
    }
  }

  /**
   * Track page view
   */
  pageView(params?: Record<string, any>): void {
    if (!this.isReady()) return

    const tmrData = {
      id: this.config.counterId,
      type: 'pageView',
      start: new Date().getTime(),
      ...params
    }

    ;(window as any)._tmr.push(tmrData)

    if (this.debug) {
      console.log('[TopMailRu] Page view tracked:', tmrData)
    }
  }

  /**
   * Track goal (conversion)
   */
  goal(goalName: string, params?: Record<string, any>): void {
    if (!this.isReady()) return

    const tmrData = {
      id: this.config.counterId,
      type: 'reachGoal',
      goal: goalName,
      start: new Date().getTime(),
      ...params
    }

    ;(window as any)._tmr.push(tmrData)

    if (this.debug) {
      console.log('[TopMailRu] Goal tracked:', tmrData)
    }
  }

  /**
   * Track custom event
   */
  event(event: TopMailRuEvent): void {
    if (!this.isReady()) return

    const tmrData = {
      id: this.config.counterId,
      type: event.type,
      start: new Date().getTime(),
      ...event.params
    }

    if (event.goal) {
      (tmrData as any).goal = event.goal
    }

    ;(window as any)._tmr.push(tmrData)

    if (this.debug) {
      console.log('[TopMailRu] Event tracked:', tmrData)
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && 
           typeof window !== 'undefined' && 
           !!(window as any)._tmr
  }

  /**
   * Get service health
   */
  getHealth() {
    return {
      loaded: this.isReady(),
      counterId: this.config.counterId,
      error: this.isReady() ? undefined : 'Service not initialized or script not loaded'
    }
  }

  /**
   * Get noscript fallback HTML for SSR
   */
  static getNoscriptFallback(counterId: string): string {
    return `<div><img src="https://top-fwz1.mail.ru/counter?id=${counterId};js=na" style="position:absolute;left:-9999px;" alt="Top.Mail.Ru" /></div>`
  }
}

// Extend window interface for Top.Mail.Ru
declare global {
  interface Window {
    _tmr?: Array<{
      id: string
      type: string
      start: number
      goal?: string
      [key: string]: any
    }>
  }
}
