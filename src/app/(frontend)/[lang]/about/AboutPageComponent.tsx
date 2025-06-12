'use client'

import React from 'react'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export function AboutPageComponent({ data }: AboutPageComponentProps) {
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

  return (
    <motion.div
      className="min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      {data.hero && (
        <motion.section variants={sectionVariants}>
          <HeroSection data={data.hero} />
        </motion.section>
      )}

      {/* Mission Section */}
      {data.mission && (
        <motion.section variants={sectionVariants}>
          <MissionSection data={data.mission} />
        </motion.section>
      )}

      {/* Stats Section */}
      {data.stats && data.stats.items && data.stats.items.length > 0 && (
        <motion.section variants={sectionVariants}>
          <StatsSection data={data.stats} />
        </motion.section>
      )}

      {/* Founder Section */}
      {data.founder && (
        <motion.section variants={sectionVariants}>
          <FounderSection data={data.founder} />
        </motion.section>
      )}

      {/* Values Section */}
      {data.values && data.values.items && data.values.items.length > 0 && (
        <motion.section variants={sectionVariants}>
          <ValuesSection data={data.values} />
        </motion.section>
      )}

      {/* Approach Section */}
      {data.approach && data.approach.steps && data.approach.steps.length > 0 && (
        <motion.section variants={sectionVariants}>
          <ApproachSection data={data.approach} />
        </motion.section>
      )}

      {/* CTA Section */}
      {data.cta && (
        <motion.section variants={sectionVariants}>
          <CTASection data={data.cta} />
        </motion.section>
      )}
    </motion.div>
  )
}
