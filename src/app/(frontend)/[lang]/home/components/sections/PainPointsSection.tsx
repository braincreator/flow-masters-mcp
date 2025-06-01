'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { AlertTriangle, Clock, TrendingDown, Users, DollarSign, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLeadFormModal } from '../LeadFormModalProvider'

const painPoints = [
  {
    icon: Clock,
    title: 'Тратите часы на рутину?',
    description: 'Ваши сотрудники тонут в повторяющихся задачах вместо развития бизнеса',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: TrendingDown,
    title: 'Теряете клиентов?',
    description: 'Медленная обработка заявок и отсутствие персонализации отпугивают покупателей',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Users,
    title: 'Конкуренты обгоняют?',
    description: 'Пока вы думаете, другие уже запускают ИИ-ботов и автоматизируют продажи',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: DollarSign,
    title: 'Растут расходы?',
    description: 'Найм новых сотрудников стоит дороже, чем внедрение ИИ-решений',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Target,
    title: 'Низкая конверсия?',
    description: 'Без персонализации и быстрой реакции посетители не становятся клиентами',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: AlertTriangle,
    title: 'Боитесь отстать?',
    description: 'ИИ уже не будущее — это настоящее. Каждый день промедления стоит денег',
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
  },
]

export function PainPointsSection() {
  const { openModal } = useLeadFormModal()

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <GridContainer>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Узнаёте себя?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Если вы не внедряете ИИ — вы спонсируете тех, кто уже это сделал
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {painPoints.map((point, index) => {
            const Icon = point.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div
                  className={cn(
                    'p-8 rounded-2xl border-2 border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-gray-300 h-full',
                    'hover:-translate-y-2',
                  )}
                >
                  <div
                    className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-300',
                      point.bgColor,
                      'group-hover:scale-110',
                    )}
                  >
                    <Icon className={cn('w-8 h-8', point.color)} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
                    {point.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{point.description}</p>

                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Каждый день промедления = потерянная прибыль
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Пока вы читаете это, ваши конкуренты уже получают заявки через ИИ-ботов
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() =>
                openModal({ type: 'urgent', title: 'Хватит терять деньги! Начать сейчас' })
              }
            >
              Хватит терять деньги! Начать сейчас →
            </motion.button>
          </div>
        </motion.div>
      </GridContainer>
    </section>
  )
}
