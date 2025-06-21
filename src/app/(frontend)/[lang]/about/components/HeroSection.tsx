'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { MobileOptimizedMotion, MobileOptimizedHover } from '@/components/MobileOptimizedMotion'
import { useMobileAnimations, getGPUAcceleratedStyles, getOptimizedHoverProps } from '@/hooks/useMobileAnimations'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  data: {
    title: string
    subtitle: string
    backgroundImage?: {
      url: string
      alt?: string
    }
  }
}

export function HeroSection({ data }: HeroSectionProps) {
  const locale = useLocale()
  const animationConfig = useMobileAnimations()
  const gpuStyles = getGPUAcceleratedStyles(animationConfig)
  const hoverProps = getOptimizedHoverProps(animationConfig)

  return (
    <section
      className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden mobile-optimized-container"
      aria-labelledby="hero-title"
      role="banner"
      style={gpuStyles}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/8 dark:from-primary/12 dark:via-background dark:to-secondary/12" />

      {/* Background Image */}
      {data.backgroundImage && (
        <div className="absolute inset-0 opacity-10 dark:opacity-15">
          <Image
            src={data.backgroundImage.url}
            alt={data.backgroundImage.alt || ''}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Optimized Animated Background Elements - Disabled on mobile for performance */}
      {animationConfig.enableComplexAnimations && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-primary/15 dark:bg-primary/20 rounded-full blur-xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={gpuStyles}
          />
          <motion.div
            className="absolute top-40 right-20 w-32 h-32 bg-secondary/15 dark:bg-secondary/20 rounded-full blur-xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={gpuStyles}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-16 h-16 bg-accent/15 dark:bg-accent/20 rounded-full blur-xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={gpuStyles}
          />
        </div>
      )}

      {/* Static background elements for mobile */}
      {!animationConfig.enableComplexAnimations && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 dark:bg-primary/15 rounded-full blur-xl" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 dark:bg-secondary/15 rounded-full blur-xl" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-accent/10 dark:bg-accent/15 rounded-full blur-xl" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <MobileOptimizedMotion fallbackAnimation="fade">
          <div className="max-w-4xl mx-auto">
            {/* Icon */}
            <MobileOptimizedMotion delay={200} fallbackAnimation="scale">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary/15 dark:bg-primary/25 rounded-full flex items-center justify-center border border-primary/20 dark:border-primary/30 shadow-lg dark:shadow-primary/10">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  {/* Pulse animation only on desktop */}
                  {animationConfig.enableComplexAnimations && (
                    <motion.div
                      className="absolute inset-0 bg-primary/25 dark:bg-primary/35 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={gpuStyles}
                    />
                  )}
                </div>
              </div>
            </MobileOptimizedMotion>

            {/* Title */}
            <MobileOptimizedMotion delay={400} fallbackAnimation="slide">
              <h1
                id="hero-title"
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-foreground leading-tight tracking-tight"
              >
                {data.title}
              </h1>
            </MobileOptimizedMotion>

            {/* Subtitle */}
            <MobileOptimizedMotion delay={600} fallbackAnimation="slide">
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                {data.subtitle}
              </p>
            </MobileOptimizedMotion>

            {/* CTA Buttons */}
            <MobileOptimizedMotion delay={800} fallbackAnimation="slide">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <MobileOptimizedHover
                  className={cn(
                    'transition-all duration-300 ease-out',
                    !animationConfig.isMobile && 'hover:scale-[1.02]'
                  )}
                >
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-primary hover:bg-primary/90 dark:hover:bg-primary/95 text-primary-foreground px-10 py-5 text-lg font-semibold rounded-2xl shadow-lg dark:shadow-primary/10 hover:shadow-xl dark:hover:shadow-primary/20"
                    asChild
                  >
                    <Link href={`/${locale}#final-cta`}>
                      <span className="relative z-10 flex items-center gap-2">
                        Обсудить проект
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                      {animationConfig.enableHoverAnimations && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 dark:from-primary dark:to-primary/90"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </Button>
                </MobileOptimizedHover>

                <MobileOptimizedHover
                  className={cn(
                    'transition-all duration-300 ease-out',
                    !animationConfig.isMobile && 'hover:scale-[1.02]'
                  )}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="group border-2 border-primary/30 dark:border-primary/40 hover:border-primary/50 dark:hover:border-primary/60 text-foreground hover:text-primary px-8 py-4 text-base font-medium rounded-2xl bg-background/90 dark:bg-background/95 backdrop-blur-sm hover:shadow-lg dark:hover:shadow-primary/10"
                    asChild
                  >
                    <Link href={`/${locale}/services`}>
                      <span className="flex items-center gap-2">
                        Наши услуги
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Button>
                </MobileOptimizedHover>
              </div>
            </MobileOptimizedMotion>
          </div>
        </MobileOptimizedMotion>
      </div>

      {/* Scroll Indicator - positioned at the bottom of the section */}
      <MobileOptimizedMotion delay={1000} fallbackAnimation="fade">
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-6 h-10 border-2 border-primary/40 dark:border-primary/50 rounded-full flex justify-center bg-background/20 dark:bg-background/30 backdrop-blur-sm">
            <div className="w-1 h-3 bg-primary/60 dark:bg-primary/70 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </MobileOptimizedMotion>
    </section>
  )
}
