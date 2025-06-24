/**
 * Modern VK Ads Pixel implementation for Next.js App Directory
 */

import { VKPixelConfig, AnalyticsError } from './types'

export class VKPixelService {
  private configs: VKPixelConfig[]
  private isInitialized = false
  private debug = false

  constructor(configs: VKPixelConfig | VKPixelConfig[], debug = false) {
    this.configs = Array.isArray(configs) ? configs : [configs]
    this.debug = debug
  }

  /**
   * Initialize VK Ads Pixel
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    // Filter enabled pixels
    const enabledConfigs = this.configs.filter(config => config.enabled !== false)
    if (enabledConfigs.length === 0) {
      return
    }

    try {
      await this.loadScript()
      this.initializePixels(enabledConfigs)
      this.isInitialized = true
      
      if (this.debug) {
        console.log('[VKPixel] Initialized successfully', {
          pixelIds: enabledConfigs.map(c => c.pixelId)
        })
      }
    } catch (error) {
      const analyticsError = new AnalyticsError(
        `Failed to initialize VK Pixel: ${error}`,
        'vk_pixel'
      )
      
      if (this.debug) {
        console.error('[VKPixel] Initialization failed:', error)
      }
      
      throw analyticsError
    }
  }

  /**
   * Load VK Pixel script
   */
  private async loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if VK object is already loaded
      if (window.VK?.Retargeting) {
        resolve()
        return
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src*="vk.com/js/api/openapi.js"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', reject)
        return
      }

      // Create and load script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = 'https://vk.com/js/api/openapi.js?169'
      
      script.onload = () => {
        // Wait a bit for VK object to be available
        setTimeout(() => {
          if (window.VK?.Retargeting) {
            resolve()
          } else {
            reject(new Error('VK Retargeting object not available'))
          }
        }, 100)
      }
      
      script.onerror = () => reject(new Error('Failed to load VK Pixel script'))
      
      document.head.appendChild(script)
    })
  }

  /**
   * Initialize pixels
   */
  private initializePixels(configs: VKPixelConfig[]): void {
    if (!window.VK?.Retargeting) {
      throw new Error('VK Retargeting not available')
    }

    configs.forEach(config => {
      try {
        window.VK!.Retargeting.Init(config.pixelId)
        
        // Track initial page view if enabled
        if (config.trackPageView !== false) {
          window.VK!.Retargeting.Hit()
        }

        if (this.debug) {
          console.log('[VKPixel] Pixel initialized:', config.pixelId)
        }
      } catch (error) {
        if (this.debug) {
          console.error('[VKPixel] Failed to initialize pixel:', config.pixelId, error)
        }
      }
    })
  }

  /**
   * Track custom event
   */
  event(eventName: string, params?: Record<string, any>): void {
    if (!this.isReady()) return

    try {
      if (params) {
        window.VK!.Retargeting.Event(eventName, params)
      } else {
        window.VK!.Retargeting.Event(eventName)
      }

      if (this.debug) {
        console.log('[VKPixel] Event tracked:', { event: eventName, params })
      }
    } catch (error) {
      if (this.debug) {
        console.error('[VKPixel] Failed to track event:', error)
      }
    }
  }

  /**
   * Track goal
   */
  goal(goalName: string, params?: Record<string, any>): void {
    if (!this.isReady()) return

    try {
      if (params) {
        window.VK!.Retargeting.Goal(goalName, params)
      } else {
        window.VK!.Retargeting.Goal(goalName)
      }

      if (this.debug) {
        console.log('[VKPixel] Goal tracked:', { goal: goalName, params })
      }
    } catch (error) {
      if (this.debug) {
        console.error('[VKPixel] Failed to track goal:', error)
      }
    }
  }

  /**
   * Track page hit
   */
  hit(): void {
    if (!this.isReady()) return

    try {
      window.VK!.Retargeting.Hit()

      if (this.debug) {
        console.log('[VKPixel] Page hit tracked')
      }
    } catch (error) {
      if (this.debug) {
        console.error('[VKPixel] Failed to track hit:', error)
      }
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && 
           typeof window !== 'undefined' && 
           !!window.VK?.Retargeting
  }

  /**
   * Get service health
   */
  getHealth() {
    return {
      loaded: this.isReady(),
      pixelIds: this.configs.map(c => c.pixelId),
      error: this.isReady() ? undefined : 'Service not initialized or script not loaded'
    }
  }

  /**
   * Get enabled pixel IDs
   */
  getEnabledPixelIds(): string[] {
    return this.configs
      .filter(config => config.enabled !== false)
      .map(config => config.pixelId)
  }
}
