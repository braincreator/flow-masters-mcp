'use client'

import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GridContainer } from '@/components/GridContainer'
import { ArrowRight, Bot, Zap, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { TechLogos } from '../TechLogos'

const floatingElements = [
  { icon: Bot, delay: 0, x: 20, y: 30 },
  { icon: Zap, delay: 0.5, x: -30, y: 20 },
  { icon: TrendingUp, delay: 1, x: 40, y: -20 },
  { icon: Clock, delay: 1.5, x: -20, y: -30 },
]

export function AIHeroSection() {
  const [currentStep, setCurrentStep] = useState(0)
  const controls = useAnimation()
  const locale = useLocale()
  const t = useTranslations('aiAgency.hero')

  const aiProcessSteps = [
    t('processSteps.0'),
    t('processSteps.1'),
    t('processSteps.2'),
    t('processSteps.3'),
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % aiProcessSteps.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [aiProcessSteps.length])

  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.5 },
    })
  }, [currentStep, controls])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

        {/* Floating AI Elements */}
        {floatingElements.map((element, index) => {
          const Icon = element.icon
          return (
            <motion.div
              key={index}
              className="absolute text-primary/30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1],
                x: [element.x, element.x + 10, element.x],
                y: [element.y, element.y - 10, element.y],
              }}
              transition={{
                duration: 4,
                delay: element.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                left: `${20 + index * 20}%`,
                top: `${20 + index * 15}%`,
              }}
            >
              <Icon size={40} />
            </motion.div>
          )
        })}
      </div>

      <GridContainer>
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('title')}
              </span>
              <br />
              <span className="text-white">{t('subtitle')}</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </motion.div>

          {/* AI Process Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
              <motion.div animate={controls} className="text-lg font-medium text-white mb-2">
                {t('processText.now')}{' '}
                {currentStep == aiProcessSteps.length - 1
                  ? t('processText.you')
                  : t('processText.we')}
                : {aiProcessSteps[currentStep]}
              </motion.div>
              <div className="flex justify-between mt-4">
                {aiProcessSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-2 flex-1 mx-1 rounded-full transition-all duration-500',
                      index <= currentStep
                        ? 'bg-gradient-to-r from-blue-400 to-purple-400'
                        : 'bg-white/20',
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href={`/${locale}/services/ai-audit-free`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
              >
                {t('buttons.freeAudit')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-transparent bg-clip-padding px-8 py-4 text-lg rounded-xl font-semibold transition-all duration-300
                text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text
                border-gradient-to-r from-blue-600 to-purple-600
                hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:bg-opacity-60"
            >
              {t('buttons.learnMore')}
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-gray-200 mb-4">{t('socialProof')}</p>
            <TechLogos />
          </motion.div>
        </div>
      </GridContainer>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
