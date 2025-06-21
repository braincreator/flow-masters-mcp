import React from 'react'
import { motion } from 'framer-motion'
import { MobileOptimizedMotion, MobileOptimizedMotionGroup } from '@/components/MobileOptimizedMotion'
import { useMobileAnimations, getGPUAcceleratedStyles } from '@/hooks/useMobileAnimations'
import { TrendingUp, Award, Users, Clock } from 'lucide-react'

interface StatsSectionProps {
  data: {
    title: string
    subtitle?: string
    items: Array<{
      value: string
      label: string
      description?: string
      icon?: string
    }>
  }
}

const iconMap = {
  'trending-up': TrendingUp,
  award: Award,
  users: Users,
  clock: Clock,
}

export function StatsSection({ data }: StatsSectionProps) {
  const animationConfig = useMobileAnimations()
  const gpuStyles = getGPUAcceleratedStyles(animationConfig)

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden mobile-optimized-container" style={gpuStyles}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/8 dark:from-primary/12 dark:via-background dark:to-secondary/12" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <MobileOptimizedMotion fallbackAnimation="slide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            )}
          </div>
        </MobileOptimizedMotion>

        {/* Stats Grid */}
        <MobileOptimizedMotionGroup staggerDelay={animationConfig.isMobile ? 100 : 150}>
          {data.items.map((stat, index) => {
            const IconComponent = stat.icon
              ? iconMap[stat.icon as keyof typeof iconMap] || TrendingUp
              : TrendingUp

            return (
              <div key={index} className="group">
                <div className={cn(
                  'relative bg-gradient-to-br from-card/90 to-card/60 dark:from-card/95 dark:to-card/70 backdrop-blur-md border border-border/50 dark:border-border/70 rounded-3xl p-8 text-center transition-all duration-500 overflow-hidden',
                  !animationConfig.isMobile && 'hover:shadow-2xl dark:hover:shadow-primary/5 hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/60'
                )}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] group-hover:opacity-[0.05] dark:group-hover:opacity-[0.08] transition-opacity duration-500">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(circle at 20px 20px, currentColor 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                      }}
                    />
                  </div>

                  {/* Top accent line */}
                  {animationConfig.enableHoverAnimations && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 flex justify-center mb-8">
                    <div className={cn(
                      'w-20 h-20 bg-gradient-to-br from-primary/25 to-primary/15 dark:from-primary/30 dark:to-primary/20 rounded-2xl flex items-center justify-center shadow-lg dark:shadow-primary/10 transition-all duration-500 border border-primary/20 dark:border-primary/30',
                      !animationConfig.isMobile && 'group-hover:shadow-xl dark:group-hover:shadow-primary/15'
                    )}>
                      <IconComponent className="w-10 h-10 text-primary" />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="relative z-10 mb-6">
                    <div className="text-5xl md:text-6xl font-bold text-foreground mb-3 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold text-primary uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>

                  {/* Description */}
                  {stat.description && (
                    <p className="relative z-10 text-sm text-muted-foreground/90 dark:text-muted-foreground/80 leading-relaxed">
                      {stat.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </MobileOptimizedMotionGroup>

        {/* Bottom Decoration */}
        <MobileOptimizedMotion delay={600} fallbackAnimation="scale">
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-primary" />
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </div>
        </MobileOptimizedMotion>
      </div>
    </section>
  )
}
