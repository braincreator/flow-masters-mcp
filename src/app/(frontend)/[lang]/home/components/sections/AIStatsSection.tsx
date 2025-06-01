'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'

export function AIStatsSection() {
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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Цифры, которые говорят сами за себя
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">25%</div>
                <div className="text-gray-600">Рост конверсии</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">80ч</div>
                <div className="text-gray-600">Экономия времени</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">35%</div>
                <div className="text-gray-600">Снижение затрат</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Работа без выходных</div>
              </div>
            </div>
          </motion.div>
        </div>
      </GridContainer>
    </section>
  )
}
