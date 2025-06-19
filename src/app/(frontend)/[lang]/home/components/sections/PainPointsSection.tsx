'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { AlertTriangle, Clock, TrendingDown, Users, DollarSign, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLeadFormModal } from '../LeadFormModalProvider'
import { useTranslations } from 'next-intl'
import { MobileOptimizedMotion, MobileOptimizedMotionGroup, MobileOptimizedHover } from '@/components/MobileOptimizedMotion'
import { useMobileAnimations } from '@/hooks/useMobileAnimations'

const painPointIcons = [
  { icon: Clock, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { icon: TrendingDown, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { icon: Users, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { icon: DollarSign, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { icon: Target, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-600/10' },
]

export function PainPointsSection() {
  const { openModal } = useLeadFormModal()
  const t = useTranslations('aiAgency.painPoints')
  const animationConfig = useMobileAnimations()

  const painPoints = painPointIcons.map((iconConfig, index) => ({
    title: t(`points.${index}.title`),
    description: t(`points.${index}.description`),
    ...iconConfig,
  }))

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/50">
      <GridContainer>
        <div className="text-center mb-16">
          <MobileOptimizedMotion>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('title')}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </MobileOptimizedMotion>
        </div>

        <MobileOptimizedMotionGroup
          staggerDelay={100}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {painPoints.map((point, index) => {
            const Icon = point.icon
            return (
              <div key={index} className="group relative">
                <MobileOptimizedHover
                  hoverClassName={animationConfig.enableHoverAnimations ? "hover:shadow-xl hover:border-border/60 hover:-translate-y-2" : ""}
                  className={cn(
                    'p-8 rounded-2xl border-2 border-border bg-card transition-all duration-300 h-full',
                  )}
                >
                  <div
                    className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300',
                      point.bgColor,
                      animationConfig.enableHoverAnimations && 'group-hover:scale-110',
                    )}
                  >
                    <Icon className={cn('w-8 h-8', point.color)} />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-foreground/80 transition-colors">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{point.description}</p>

                  {animationConfig.enableHoverAnimations && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </MobileOptimizedHover>
              </div>
            )
          })}
        </MobileOptimizedMotionGroup>

        <MobileOptimizedMotion delay={300} className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
            <h3 className="text-2xl font-bold text-foreground mb-4">{t('urgency.title')}</h3>
            <p className="text-lg text-foreground/80 mb-6">{t('urgency.description')}</p>
            <MobileOptimizedHover hoverClassName="hover:scale-105">
              <button
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => openModal({ type: 'urgent', title: t('urgency.button') })}
              >
                {t('urgency.button')} →
              </button>
            </MobileOptimizedHover>
          </div>
        </MobileOptimizedMotion>
      </GridContainer>
    </section>
  )
}
