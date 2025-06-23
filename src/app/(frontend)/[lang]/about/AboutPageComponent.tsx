'use client'

import React, { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import { HeroSection } from './components/HeroSection'
import { MissionSection } from './components/MissionSection'
import { StatsSection } from './components/StatsSection'
import { FounderSection } from './components/FounderSection'
import { ValuesSection } from './components/ValuesSection'
import { ApproachSection } from './components/ApproachSection'
import { CTASection } from './components/CTASection'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MobileOptimizedMotion, MobileOptimizedMotionGroup } from '@/components/MobileOptimizedMotion'
import { useMobileAnimations, getSmoothAnimationProps, getGPUAcceleratedStyles } from '@/hooks/useMobileAnimations'

// Lazy load heavy sections for better performance
const LazyFounderSection = lazy(() =>
  import('./components/FounderSection').then(m => ({ default: m.FounderSection }))
)
const LazyValuesSection = lazy(() =>
  import('./components/ValuesSection').then(m => ({ default: m.ValuesSection }))
)
const LazyApproachSection = lazy(() =>
  import('./components/ApproachSection').then(m => ({ default: m.ApproachSection }))
)

// Loading fallback component
const SectionSkeleton = () => (
  <div className="py-20 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
      <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded"></div>
        ))}
      </div>
    </div>
  </div>
)

interface AboutPageData {
  hero: {
    title: string
    subtitle: string
    backgroundImage?: {
      url: string
      alt?: string
    }
  }
  mission: {
    title: string
    content: any // Rich text content
  }
  stats: {
    title: string
    subtitle?: string
    items: Array<{
      value: string
      label: string
      description?: string
      icon?: string
    }>
  }
  founder: {
    title: string
    name: string
    role: string
    bio: any // Rich text content
    photo?: {
      url: string
      alt?: string
    }
    socialLinks?: {
      linkedin?: string
      telegram?: string
      email?: string
      website?: string
    }
  }
  values: {
    title: string
    subtitle?: string
    items: Array<{
      title: string
      description: string
      icon?: string
    }>
  }
  approach: {
    title: string
    subtitle?: string
    steps: Array<{
      title: string
      description: string
      icon?: string
    }>
  }
  cta: {
    title: string
    subtitle?: string
    primaryButton: {
      text: string
      url: string
    }
    secondaryButton?: {
      text: string
      url: string
    }
  }
}

interface AboutPageComponentProps {
  data: AboutPageData
}

export function AboutPageComponent({ data }: AboutPageComponentProps) {
  const animationConfig = useMobileAnimations()
  const gpuStyles = getGPUAcceleratedStyles(animationConfig)

  // Проверка наличия обязательных данных
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Данные страницы "О нас" не найдены. Пожалуйста, попробуйте позже.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Optimized container variants based on device capabilities
  const containerVariants = animationConfig.shouldReduceMotion || animationConfig.preferCSSAnimations
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: animationConfig.isMobile ? 0.05 : 0.1,
            delayChildren: animationConfig.isMobile ? 0.05 : 0.1,
            ease: [0.25, 0.1, 0.25, 1], // Smooth easing
          },
        },
      }

  const sectionVariants = animationConfig.shouldReduceMotion
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: 'easeOut' },
        },
      }

  return (
    <motion.div
      className="min-h-screen mobile-optimized-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={gpuStyles}
    >
      {/* Hero Section - Always loaded */}
      {data.hero && (
        <MobileOptimizedMotion>
          <HeroSection data={data.hero} />
        </MobileOptimizedMotion>
      )}

      {/* Mission Section - Always loaded */}
      {data.mission && (
        <MobileOptimizedMotion delay={100}>
          <MissionSection data={data.mission} />
        </MobileOptimizedMotion>
      )}

      {/* Stats Section - Always loaded */}
      {data.stats && data.stats.items && data.stats.items.length > 0 && (
        <MobileOptimizedMotion delay={200}>
          <StatsSection data={data.stats} />
        </MobileOptimizedMotion>
      )}

      {/* Founder Section - Lazy loaded */}
      {data.founder && (
        <MobileOptimizedMotion delay={300}>
          <Suspense fallback={<SectionSkeleton />}>
            <LazyFounderSection data={data.founder} />
          </Suspense>
        </MobileOptimizedMotion>
      )}

      {/* Values Section - Lazy loaded */}
      {data.values && data.values.items && data.values.items.length > 0 && (
        <MobileOptimizedMotion delay={400}>
          <Suspense fallback={<SectionSkeleton />}>
            <LazyValuesSection data={data.values} />
          </Suspense>
        </MobileOptimizedMotion>
      )}

      {/* Approach Section - Lazy loaded */}
      {data.approach && data.approach.steps && data.approach.steps.length > 0 && (
        <MobileOptimizedMotion delay={500}>
          <Suspense fallback={<SectionSkeleton />}>
            <LazyApproachSection data={data.approach} />
          </Suspense>
        </MobileOptimizedMotion>
      )}

      {/* CTA Section - Always loaded */}
      {data.cta && (
        <MobileOptimizedMotion delay={600}>
          <CTASection data={data.cta} />
        </MobileOptimizedMotion>
      )}
    </motion.div>
  )
}
