'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { TrendingUp, Clock, DollarSign, Users, CheckCircle } from 'lucide-react'
import { useLeadFormModal } from '../LeadFormModalProvider'

const benefits = [
  {
    icon: TrendingUp,
    title: 'Рост продаж на 25%',
    description: 'ИИ-ассистент работает 24/7, не теряет лиды и конвертирует посетителей в клиентов',
    stats: '+25% конверсия',
  },
  {
    icon: Clock,
    title: 'Экономия 80 часов в месяц',
    description: 'Автоматизация повторяющихся задач освобождает команду для стратегических решений',
    stats: '80 часов/мес',
  },
  {
    icon: DollarSign,
    title: 'Снижение затрат на 35%',
    description: 'ИИ-ассистент помогает оптимизировать процессы и сократить операционные расходы',
    stats: '-35% затрат',
  },
  {
    icon: Users,
    title: 'Работа без выходных',
    description: 'ИИ анализирует поведение клиентов и предлагает точки роста бизнеса',
    stats: '24/7 работа',
  },
]

export function AIBenefitsSection() {
  const { openModal } = useLeadFormModal()

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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Что даст вам ИИ через
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}
                2-3 месяца?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Реальные результаты, которые получают наши клиенты
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
                className="p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                    <div className="text-2xl font-bold text-blue-600">{benefit.stats}</div>
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
          <h3 className="text-2xl font-bold mb-6">
            Средние результаты наших клиентов за первые 3 месяца:
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">+15%</div>
              <div className="text-blue-100">Рост конверсии</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">-25%</div>
              <div className="text-blue-100">Снижение затрат</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Работа без выходных</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">6-8</div>
              <div className="text-blue-100">Недель до результата</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => openModal({ type: 'results', title: 'Получить такие же результаты' })}
          >
            Получить такие же результаты →
          </motion.button>
        </motion.div>
      </GridContainer>
    </section>
  )
}
