'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { AlertTriangle, Clock } from 'lucide-react'
import { useLeadFormModal } from '../LeadFormModalProvider'

export function UrgencySection() {
  const { openModal } = useLeadFormModal()
  return (
    <section className="py-20 bg-gradient-to-b from-red-900 to-red-800 text-white">
      <GridContainer>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-red-900" />
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6">⚠️ КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ</h2>

            <p className="text-2xl md:text-3xl text-red-100 mb-8 max-w-4xl mx-auto">
              Пока вы думаете, ваши конкуренты уже захватывают рынок с помощью ИИ
            </p>

            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 mb-8">
              <h3 className="text-3xl font-bold mb-4">🔥 ОГРАНИЧЕННОЕ ПРЕДЛОЖЕНИЕ</h3>
              <p className="text-xl text-red-100 mb-6">
                Скидка 30% на все пакеты действует только до конца месяца
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-400 text-red-900 px-8 py-4 rounded-xl font-bold text-xl"
                onClick={() => openModal({ type: 'urgent', title: 'Срочно начать проект' })}
              >
                🚀 СРОЧНО НАЧАТЬ ПРОЕКТ
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg"
                onClick={() => openModal({ type: 'urgent', title: 'Экстренная консультация' })}
              >
                Экстренная консультация
              </motion.button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-yellow-300">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Ответим в течение 2 часов в рабочее время</span>
            </div>
          </motion.div>
        </div>
      </GridContainer>
    </section>
  )
}
