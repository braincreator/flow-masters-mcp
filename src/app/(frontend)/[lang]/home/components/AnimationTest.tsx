'use client'

import React from 'react'
import { MobileOptimizedMotion, MobileOptimizedMotionGroup, MobileOptimizedHover } from '@/components/MobileOptimizedMotion'
import { TechIcon } from '@/components/TechIcon'
import { useMobileAnimations } from '@/hooks/useMobileAnimations'

/**
 * Test component to verify animation improvements
 * This can be temporarily added to test the fixes
 */
export function AnimationTest() {
  const animationConfig = useMobileAnimations()
  
  const testIcons = ['openai', 'react', 'nextjs', 'typescript', 'python', 'flutter']
  
  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Animation Test</h2>
        <p className="text-muted-foreground">
          Mobile: {animationConfig.isMobile ? 'Yes' : 'No'} | 
          Reduced Motion: {animationConfig.shouldReduceMotion ? 'Yes' : 'No'} | 
          CSS Animations: {animationConfig.preferCSSAnimations ? 'Yes' : 'No'}
        </p>
      </div>
      
      {/* Test individual animations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual Animations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testIcons.map((icon, index) => (
            <MobileOptimizedMotion key={icon} delay={index * 100}>
              <MobileOptimizedHover>
                <div className="p-4 border rounded-lg bg-card">
                  <TechIcon slug={icon} size="lg" className="mx-auto mb-2" />
                  <p className="text-center text-sm">{icon}</p>
                </div>
              </MobileOptimizedHover>
            </MobileOptimizedMotion>
          ))}
        </div>
      </div>
      
      {/* Test group animations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Group Animations</h3>
        <MobileOptimizedMotionGroup staggerDelay={150}>
          {testIcons.map((icon) => (
            <div key={icon} className="p-3 border rounded bg-card/50">
              <TechIcon slug={icon} size="md" className="inline-block mr-2" />
              <span>{icon}</span>
            </div>
          ))}
        </MobileOptimizedMotionGroup>
      </div>
      
      {/* Test scroll container */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Horizontal Scroll Test</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {testIcons.map((icon, index) => (
            <div 
              key={icon} 
              className="min-w-[200px] p-4 border rounded-lg bg-card snap-center"
            >
              <TechIcon slug={icon} size="xl" className="mx-auto mb-2" />
              <p className="text-center">Card {index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
