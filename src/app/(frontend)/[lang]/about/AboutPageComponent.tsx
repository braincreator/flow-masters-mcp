'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

import { HeroSection } from './components/HeroSection'
import { MissionSection } from './components/MissionSection'
import { StatsSection } from './components/StatsSection'
import { FounderSection } from './components/FounderSection'
import { ValuesSection } from './components/ValuesSection'
import { ApproachSection } from './components/ApproachSection'
import { CTASection } from './components/CTASection'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AnimatedSection } from './components/AnimatedSection'

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
  const shouldReduceMotion = useReducedMotion()

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

  // Simplified container variants for better performance
  const containerVariants = shouldReduceMotion
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }

  const sectionVariants = shouldReduceMotion
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
      className="min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      {data.hero && (
        <AnimatedSection>
          <HeroSection data={data.hero} />
        </AnimatedSection>
      )}

      {/* Mission Section */}
      {data.mission && (
        <AnimatedSection delay={0.1}>
          <MissionSection data={data.mission} />
        </AnimatedSection>
      )}

      {/* Stats Section */}
      {data.stats && data.stats.items && data.stats.items.length > 0 && (
        <AnimatedSection delay={0.2}>
          <StatsSection data={data.stats} />
        </AnimatedSection>
      )}

      {/* Founder Section */}
      {data.founder && (
        <AnimatedSection delay={0.3}>
          <FounderSection data={data.founder} />
        </AnimatedSection>
      )}

      {/* Values Section */}
      {data.values && data.values.items && data.values.items.length > 0 && (
        <AnimatedSection delay={0.4}>
          <ValuesSection data={data.values} />
        </AnimatedSection>
      )}

      {/* Approach Section */}
      {data.approach && data.approach.steps && data.approach.steps.length > 0 && (
        <AnimatedSection delay={0.5}>
          <ApproachSection data={data.approach} />
        </AnimatedSection>
      )}

      {/* CTA Section */}
      {data.cta && (
        <AnimatedSection delay={0.6}>
          <CTASection data={data.cta} />
        </AnimatedSection>
      )}
    </motion.div>
  )
}
