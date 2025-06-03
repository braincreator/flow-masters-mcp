'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { TrendingUp, Clock, DollarSign, Users, CheckCircle } from 'lucide-react'
import { useLeadFormModal } from '../LeadFormModalProvider'
import { useTranslations } from 'next-intl'

const benefitIcons = [TrendingUp, Clock, DollarSign, Users]

export function AIBenefitsSection() {
  const { openModal } = useLeadFormModal()
  const t = useTranslations('aiAgency.benefits')

  const benefits = benefitIcons.map((icon, index) => ({
    icon,
    title: t(`items.${index}.title`),
    description: t(`items.${index}.description`),
    stats: t(`items.${index}.stats`),
  }))

  return (
    <section className="py-20 bg-background">
      <GridContainer>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('title')}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}
                {t('titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {benefit.description}
                    </p>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {benefit.stats}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mt-16"
        >
          <h3 className="text-2xl font-bold mb-6">{t('clientResults.title')}</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">{t('clientResults.conversion')}</div>
              <div className="text-blue-100">{t('clientResults.conversionLabel')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{t('clientResults.costs')}</div>
              <div className="text-blue-100">{t('clientResults.costsLabel')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{t('clientResults.availability')}</div>
              <div className="text-blue-100">{t('clientResults.availabilityLabel')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{t('clientResults.timeline')}</div>
              <div className="text-blue-100">{t('clientResults.timelineLabel')}</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => openModal({ type: 'results', title: t('button') })}
          >
            {t('button')} →
          </motion.button>
        </motion.div>
      </GridContainer>
    </section>
  )
}
