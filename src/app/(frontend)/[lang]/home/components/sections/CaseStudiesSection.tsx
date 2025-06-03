'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

const caseStudyColors = ['bg-purple-600', 'bg-green-600', 'bg-blue-600']

export function CaseStudiesSection() {
  const t = useTranslations('aiAgency.caseStudies')
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <GridContainer>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('title')}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[0, 1, 2].map((index) => {
            const caseStudy = {
              company: t(`items.${index}.company`),
              industry: t(`items.${index}.industry`),
              challenge: t(`items.${index}.challenge`),
              solution: t(`items.${index}.solution`),
              results: t(`items.${index}.results`),
              testimonial: t(`items.${index}.testimonial`),
              bgColor: caseStudyColors[index],
              initials: t(`items.${index}.company`)
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 border border-border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-foreground/80 mb-6 italic leading-relaxed flex-grow">
                  "{caseStudy.testimonial}"
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-12 h-12 ${caseStudy.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-semibold">{caseStudy.initials}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{caseStudy.company}</div>
                    <div className="text-muted-foreground text-sm">{caseStudy.industry}</div>
                    <div className="text-muted-foreground/70 text-xs">{caseStudy.challenge}</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {caseStudy.results}
                  </div>
                  <div className="text-muted-foreground">{caseStudy.solution}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </GridContainer>
    </section>
  )
}
