'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { Star } from 'lucide-react'

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
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 italic">
                "За 3 недели ИИ-консультант стал нашим лучшим продавцом. Клиенты получают ответы мгновенно, а мы — качественные лиды."
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">АП</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Алексей Петров</div>
                  <div className="text-gray-600">Директор по продажам</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-2xl font-bold text-green-600 mb-1">ROI 1200%</div>
                <div className="text-gray-600">за 14 дней</div>
              </div>
            </motion.div>
          ))}
        </div>
      </GridContainer>
    </section>
  )
}
