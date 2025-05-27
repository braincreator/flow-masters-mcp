'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { Star } from 'lucide-react'

const caseStudies = [
  {
    quote:
      'ИИ-чатбот обрабатывает 80% запросов клиентов без участия менеджеров. Время ответа сократилось с 4 часов до 30 секунд.',
    author: 'Мария Козлова',
    position: 'Руководитель клиентского сервиса',
    company: 'Интернет-магазин электроники',
    initials: 'МК',
    bgColor: 'bg-purple-600',
    metric: '+340% конверсии',
    period: 'за 2 месяца',
    rating: 5,
  },
  {
    quote:
      'Автоматизация обработки заявок с помощью ИИ позволила увеличить количество обработанных лидов в 3 раза при том же штате.',
    author: 'Дмитрий Волков',
    position: 'Коммерческий директор',
    company: 'Строительная компания',
    initials: 'ДВ',
    bgColor: 'bg-green-600',
    metric: 'Экономия 180 ч/мес',
    period: 'рабочего времени',
    rating: 5,
  },
  {
    quote:
      'ИИ-помощник в Instagram отвечает на вопросы о товарах 24/7. Продажи выросли, а я могу заниматься развитием бизнеса.',
    author: 'Анна Петрова',
    position: 'Владелица магазина',
    company: 'Детская одежда',
    initials: 'АП',
    bgColor: 'bg-blue-600',
    metric: '+280% продаж',
    period: 'за 3 месяца',
    rating: 5,
  },
]

export function CaseStudiesSection() {
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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Истории успеха наших клиентов
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Реальные результаты внедрения ИИ в различных сферах бизнеса
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((caseStudy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex mb-4">
                {[...Array(caseStudy.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 italic leading-relaxed flex-grow">
                "{caseStudy.quote}"
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 ${caseStudy.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white font-semibold">{caseStudy.initials}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{caseStudy.author}</div>
                  <div className="text-gray-600 text-sm">{caseStudy.position}</div>
                  <div className="text-gray-500 text-xs">{caseStudy.company}</div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="text-2xl font-bold text-green-600 mb-1">{caseStudy.metric}</div>
                <div className="text-gray-600">{caseStudy.period}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </GridContainer>
    </section>
  )
}
