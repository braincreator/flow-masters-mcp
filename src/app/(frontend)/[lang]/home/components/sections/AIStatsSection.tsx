'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { useTranslations } from 'next-intl'

export function AIStatsSection() {
  const t = useTranslations('aiAgency.stats')
  return (
    <section className="py-20 bg-white">
      <GridContainer>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              {t('subtitle')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{t('items.0.value')}</div>
                <div className="text-gray-600">{t('items.0.label')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('items.0.description')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{t('items.1.value')}</div>
                <div className="text-gray-600">{t('items.1.label')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('items.1.description')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{t('items.2.value')}</div>
                <div className="text-gray-600">{t('items.2.label')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('items.2.description')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{t('items.3.value')}</div>
                <div className="text-gray-600">{t('items.3.label')}</div>
                <div className="text-sm text-gray-500 mt-1">{t('items.3.description')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </GridContainer>
    </section>
  )
}
