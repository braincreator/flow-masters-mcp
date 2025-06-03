'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PerformanceSettings {
  enableHeavyAnimations: boolean
  enableWebGL: boolean
  enableParticles: boolean
  animationQuality: 'low' | 'medium' | 'high'
  maxConcurrentAnimations: number
}

interface PerformanceContextType {
  settings: PerformanceSettings
  updateSettings: (newSettings: Partial<PerformanceSettings>) => void
  isHighPerformanceDevice: boolean
}

const PerformanceContext = createContext<PerformanceContextType | null>(null)

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider')
  }
  return context
}

interface PerformanceProviderProps {
  children: React.ReactNode
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [isHighPerformanceDevice, setIsHighPerformanceDevice] = useState(true)
  const [settings, setSettings] = useState<PerformanceSettings>({
    enableHeavyAnimations: true,
    enableWebGL: true,
    enableParticles: true,
    animationQuality: 'high',
    maxConcurrentAnimations: 10,
  })

  useEffect(() => {
    // Detect device performance capabilities
    const detectPerformance = () => {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      // Check for WebGL support
      const hasWebGL = !!gl
      
      // Check device memory (if available)
      const deviceMemory = (navigator as any).deviceMemory || 4
      
      // Check CPU cores
      const hardwareConcurrency = navigator.hardwareConcurrency || 4
      
      // Check if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      
      // Determine if high performance device
      const isHighPerf = hasWebGL && 
                        deviceMemory >= 4 && 
                        hardwareConcurrency >= 4 && 
                        !isMobile && 
                        !prefersReducedMotion

      setIsHighPerformanceDevice(isHighPerf)
      
      // Adjust settings based on device capabilities
      if (!isHighPerf) {
        setSettings(prev => ({
          ...prev,
          enableHeavyAnimations: false,
          enableWebGL: false,
          enableParticles: false,
          animationQuality: isMobile ? 'low' : 'medium',
          maxConcurrentAnimations: isMobile ? 3 : 5,
        }))
      }
    }

    detectPerformance()

    // Monitor performance and adjust settings
    let frameCount = 0
    let lastTime = performance.now()
    
    const checkFrameRate = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount
        frameCount = 0
        lastTime = currentTime
        
        // If FPS is low, reduce animation quality
        if (fps < 30 && settings.animationQuality === 'high') {
          setSettings(prev => ({
            ...prev,
            animationQuality: 'medium',
            enableParticles: false,
          }))
        } else if (fps < 20 && settings.animationQuality === 'medium') {
          setSettings(prev => ({
            ...prev,
            animationQuality: 'low',
            enableHeavyAnimations: false,
          }))
        }
      }
      
      requestAnimationFrame(checkFrameRate)
    }
    
    const rafId = requestAnimationFrame(checkFrameRate)
    
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [settings.animationQuality])

  const updateSettings = (newSettings: Partial<PerformanceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <PerformanceContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        isHighPerformanceDevice 
      }}
    >
      {children}
    </PerformanceContext.Provider>
  )
}

// Hook for conditional rendering based on performance
export function useConditionalRender() {
  const { settings, isHighPerformanceDevice } = usePerformance()
  
  return {
    shouldRenderHeavyAnimations: settings.enableHeavyAnimations && isHighPerformanceDevice,
    shouldRenderWebGL: settings.enableWebGL && isHighPerformanceDevice,
    shouldRenderParticles: settings.enableParticles,
    animationQuality: settings.animationQuality,
    maxConcurrentAnimations: settings.maxConcurrentAnimations,
  }
}
