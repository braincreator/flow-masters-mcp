'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { GridContainer } from '@/components/GridContainer'
import { CheckCircle, Shield } from 'lucide-react'
import { useAIAgencyPlans } from '../../hooks/useAIAgencyPlans'
import {
  formatFullPrice,
  formatPrepayment,
  getCurrencyColorClass,
} from '../../utils/planPriceFormatting'
import { useLeadFormModal } from '../LeadFormModalProvider'

export function PricingWithPrePayment() {
  const locale = useLocale() as 'en' | 'ru'
  const t = useTranslations('aiAgency.pricing')
  const { plans, loading, error } = useAIAgencyPlans({ limit: 3 })
  const { openModal } = useLeadFormModal()

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <GridContainer>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-gray-200 p-8 animate-pulse"
              >
                <div className="text-center mb-8">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="bg-gray-100 rounded-xl p-4 mb-6">
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </GridContainer>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <GridContainer>
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </GridContainer>
      </section>
    )
  }
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <GridContainer>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const formattedPrice = formatFullPrice(plan, locale, t)
            const formattedPrepayment = formatPrepayment(plan, locale)
            const currencyColorClass = getCurrencyColorClass(plan.currency)

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl flex flex-col ${
                  plan.isPopular ? 'border-purple-500 shadow-lg scale-105' : 'border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold text-center">
                      {t('popularChoice')}
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{formattedPrice}</div>

                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="text-sm text-gray-600 mb-1">{t('prepaymentLabel')}</div>
                    <div className="text-2xl font-bold text-blue-600">{formattedPrepayment}</div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      openModal({
                        type: 'pricing-plan',
                        title: `${t('selectPlan')} "${plan.name}"`,
                        description: `${t('cost')}: ${formattedPrice}. ${t('prepaymentLabel')}: ${formattedPrepayment}`,
                      })
                    }
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {t('selectPlan')}
                  </motion.button>
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
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-3xl font-bold mb-4">{t('guaranteeSection.title')}</h3>
          <p className="text-xl text-blue-100 mb-6">
            {t('guaranteeSection.description')
              .split('\n')
              .map((line, index) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg"
            onClick={() => openModal({ type: 'guarantee', title: t('guaranteeSection.button') })}
          >
            {t('guaranteeSection.button')}
          </motion.button>
        </motion.div>
      </GridContainer>
    </section>
  )
}
