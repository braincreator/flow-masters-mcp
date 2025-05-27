'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { CheckCircle, Shield } from 'lucide-react'

const plans = [
  {
    name: 'Стартер',
    price: '80 000',
    prepayment: '40 000',
    features: ['Чат-бот для одной платформы', 'Базовая интеграция с CRM', 'Техподдержка 30 дней'],
  },
  {
    name: 'Профессионал',
    price: '180 000',
    prepayment: '90 000',
    features: ['ИИ-агент + чат-боты', 'Полная интеграция', 'Техподдержка 90 дней'],
    popular: true,
  },
  {
    name: 'Корпоративный',
    price: 'от 350 000',
    prepayment: '175 000',
    features: ['Комплексная ИИ-экосистема', 'Индивидуальная разработка', 'Техподдержка 12 месяцев'],
  },
]

export function PricingWithPrePayment() {
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
              Инвестиции в будущее вашего бизнеса
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Прозрачные цены без скрытых платежей. Окупаемость за 6-12 месяцев.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-purple-500 shadow-lg scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Популярный выбор
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">{plan.price} ₽</div>

                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="text-sm text-gray-600 mb-1">Предоплата для старта:</div>
                  <div className="text-2xl font-bold text-blue-600">{plan.prepayment} ₽</div>
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

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Выбрать план
              </motion.button>
            </motion.div>
          ))}
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

          <h3 className="text-3xl font-bold mb-4">Гарантия результата</h3>
          <p className="text-xl text-blue-100 mb-6">
            Если ИИ-решение не будет работать согласно техническому заданию — вернем 100% предоплаты
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg"
          >
            Начать проект с гарантией →
          </motion.button>
        </motion.div>
      </GridContainer>
    </section>
  )
}
