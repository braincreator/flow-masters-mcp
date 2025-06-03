'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { GridContainer } from '@/components/GridContainer'
import { ChevronDown } from 'lucide-react'

export function AIFAQSection() {
  const locale = useLocale() as 'en' | 'ru'
  const t = useTranslations('aiAgency.faq')
  const tPricing = useTranslations('aiAgency.pricing')
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)

  // Create FAQs from translations
  const faqs = [0, 1, 2, 3, 4].map((index) => {
    // For the guarantee question (index 2), use the same text as in guarantee section
    if (index === 2) {
      return {
        question: t(`items.${index}.question`),
        answer: tPricing('guaranteeSection.description'), // Use detailed guarantee text
      }
    }
    return {
      question: t(`items.${index}.question`),
      answer: t(`items.${index}.answer`),
    }
  })

  return (
    <section className="py-20 bg-white">
      <GridContainer>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('subtitle')}</p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openQuestion === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openQuestion === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </GridContainer>
    </section>
  )
}
