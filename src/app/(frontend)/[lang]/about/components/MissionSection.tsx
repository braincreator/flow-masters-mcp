import React from 'react'
import { motion } from 'framer-motion'
import { Target, Lightbulb, Heart } from 'lucide-react'
import { MobileOptimizedMotion, MobileOptimizedMotionGroup } from '@/components/MobileOptimizedMotion'
import { useMobileAnimations, getGPUAcceleratedStyles } from '@/hooks/useMobileAnimations'

import { RichText } from '@/components/RichText'

interface MissionSectionProps {
  data: {
    title: string
    content: any // Rich text content
  }
}

export function MissionSection({ data }: MissionSectionProps) {
  const animationConfig = useMobileAnimations()
  const gpuStyles = getGPUAcceleratedStyles(animationConfig)

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden mobile-optimized-container" style={gpuStyles}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/8 to-background dark:via-secondary/12" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <MobileOptimizedMotion fallbackAnimation="slide">
            <div className="text-center mb-16">
              {/* Icon */}
              <MobileOptimizedMotion delay={200} fallbackAnimation="scale">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/25 to-primary/15 dark:from-primary/30 dark:to-primary/20 rounded-2xl flex items-center justify-center shadow-lg dark:shadow-primary/10 border border-primary/20 dark:border-primary/30">
                      <Target className="w-10 h-10 text-primary" />
                    </div>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl scale-110" />
                  </div>
                </div>
              </MobileOptimizedMotion>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {data.title}
              </h2>
            </div>
          </MobileOptimizedMotion>

          {/* Content */}
          <MobileOptimizedMotion delay={400} fallbackAnimation="slide">
            <div className="relative">
              {/* Main Content Card */}
              <div className="relative bg-gradient-to-br from-card/90 to-card/60 dark:from-card/95 dark:to-card/70 backdrop-blur-md border border-border/50 dark:border-border/70 rounded-3xl p-8 md:p-12 shadow-2xl dark:shadow-primary/5 hover:shadow-3xl dark:hover:shadow-primary/10 transition-all duration-500 group">
                {/* Subtle accent line */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />

                {/* Rich Text Content */}
                <div className="prose prose-lg md:prose-xl max-w-none text-center prose-headings:text-foreground prose-p:text-muted-foreground/90 dark:prose-p:text-muted-foreground/80 prose-p:leading-relaxed">
                  <RichText data={data.content} />
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/60 dark:via-primary/70 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </MobileOptimizedMotion>

          {/* Bottom Highlight */}
          <MobileOptimizedMotion delay={600} fallbackAnimation="fade">
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-full px-6 py-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  Делаем ИИ простым и доступным для каждого
                </span>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          </MobileOptimizedMotion>
        </div>
      </div>
    </section>
  )
}
