/**
 * Modern Yandex Metrica implementation for Next.js App Directory
 */

import { YandexMetricaConfig, YandexMetricaEcommerce, AnalyticsError } from './types'

export class YandexMetricaService {
  private config: YandexMetricaConfig
  private isInitialized = false
  private debug = false

  constructor(config: YandexMetricaConfig, debug = false) {
    this.config = config
    this.debug = debug
  }

  /**
   * Initialize Yandex Metrica
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
        console.log('[YandexMetrica] Initialized successfully', {
          counterId: this.config.counterId,
          options: this.config.options
        })
      }
    } catch (error) {
      const analyticsError = new AnalyticsError(
        `Failed to initialize Yandex Metrica: ${error}`,
        'yandex_metrica'
      )
      
      if (this.debug) {
        console.error('[YandexMetrica] Initialization failed:', error)
      }
      
      throw analyticsError
    }
  }

  /**
   * Load Yandex Metrica script
   */
  private async loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.ym) {
        resolve()
        return
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src*="metrika/tag"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', reject)
        return
      }

      // Create and load script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = 'https://mc.webvisor.org/metrika/tag_ww.js'
      
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Yandex Metrica script'))
      
      // Initialize ym function before script loads
      ;(function(m: any, e: any, t: any, r: any, i: any) {
        m[i] = m[i] || function() {
          (m[i].a = m[i].a || []).push(arguments)
        }
        m[i].l = 1 * (+new Date())
      })(window, document, 'script', script.src, 'ym')

      document.head.appendChild(script)
    })
  }

  /**
   * Initialize the counter
   */
  private initializeCounter(): void {
    if (!window.ym) {
      throw new Error('Yandex Metrica script not loaded')
    }

    const counterId = typeof this.config.counterId === 'string' 
      ? parseInt(this.config.counterId) 
      : this.config.counterId

    const options = {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
      defer: false,
      triggerEvent: true,
      ...this.config.options
    }

    window.ym(counterId, 'init', options)

    if (this.debug) {
      console.log('[YandexMetrica] Counter initialized:', { counterId, options })
    }
  }

  /**
   * Track page hit
   */
  hit(url?: string, options?: Record<string, any>): void {
    if (!this.isReady()) return

    const counterId = typeof this.config.counterId === 'string' 
      ? parseInt(this.config.counterId) 
      : this.config.counterId

    const hitUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '/')
    
    window.ym!(counterId, 'hit', hitUrl, options)

    if (this.debug) {
      console.log('[YandexMetrica] Hit tracked:', { url: hitUrl, options })
    }
  }

  /**
   * Track goal
   */
  goal(goalName: string, params?: Record<string, any>): void {
    if (!this.isReady()) return

    const counterId = typeof this.config.counterId === 'string' 
      ? parseInt(this.config.counterId) 
      : this.config.counterId

    if (params) {
      window.ym!(counterId, 'reachGoal', goalName, params)
    } else {
      window.ym!(counterId, 'reachGoal', goalName)
    }

    if (this.debug) {
      console.log('[YandexMetrica] Goal tracked:', { goal: goalName, params })
    }
  }

  /**
   * Track ecommerce event
   */
  ecommerce(event: YandexMetricaEcommerce): void {
    if (!this.isReady()) return

    const counterId = typeof this.config.counterId === 'string' 
      ? parseInt(this.config.counterId) 
      : this.config.counterId

    const ecommerceData = {
      ecommerce: {
        [event.action]: {
          actionField: {
            id: event.transaction_id
          },
          products: event.items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity || 1,
            brand: item.brand,
            variant: item.variant
          }))
        }
      }
    }

    window.ym!(counterId, 'ecommerce', ecommerceData)

    if (this.debug) {
      console.log('[YandexMetrica] Ecommerce tracked:', ecommerceData)
    }
  }

  /**
   * Set user parameters
   */
  userParams(params: Record<string, any>): void {
    if (!this.isReady()) return

    const counterId = typeof this.config.counterId === 'string' 
      ? parseInt(this.config.counterId) 
      : this.config.counterId

    window.ym!(counterId, 'userParams', params)

    if (this.debug) {
      console.log('[YandexMetrica] User params set:', params)
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && typeof window !== 'undefined' && !!window.ym
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
}
