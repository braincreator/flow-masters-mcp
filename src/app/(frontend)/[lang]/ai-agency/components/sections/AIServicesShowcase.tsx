'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { Bot, MessageSquare, Settings, Smartphone, Search, Zap } from 'lucide-react'

const services = [
  {
    icon: Bot,
    title: 'ИИ-агенты под ключ',
    description: 'Умные помощники для автоматизации бизнес-процессов',
    price: 'от 150 000 ₽',
    timeline: '7-14 дней',
  },
  {
    icon: MessageSquare,
    title: 'Чат-боты с нейросетями',
    description: 'Telegram, WhatsApp, Web - везде, где ваши клиенты',
    price: 'от 80 000 ₽',
    timeline: '5-10 дней',
  },
  {
    icon: Settings,
    title: 'Интеграция ИИ в процессы',
    description: 'Консалтинг и внедрение в существующие системы',
    price: 'от 200 000 ₽',
    timeline: '14-21 день',
  },
  {
    icon: Smartphone,
    title: 'Мобильные приложения с ИИ',
    description: 'Приложения с нейросетевым функционалом',
    price: 'от 300 000 ₽',
    timeline: '21-45 дней',
  },
  {
    icon: Search,
    title: 'Аудит и поиск точек для ИИ',
    description: 'Находим, где ИИ принесет максимальную выгоду',
    price: 'БЕСПЛАТНО',
    timeline: '3-7 дней',
  },
  {
    icon: Zap,
    title: 'Автоворонки и персонализация',
    description: 'Умные воронки продаж и персональные рекомендации',
    price: 'от 120 000 ₽',
    timeline: '10-14 дней',
  },
]

export function AIServicesShowcase() {
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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Наши услуги</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Полный спектр ИИ-решений для вашего бизнеса
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-10 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 min-h-[3.5rem] flex items-center">
                  {service.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{service.description}</p>

                <div className="flex justify-between items-center mb-6">
                  <div
                    className={`font-bold text-lg ${service.price === 'БЕСПЛАТНО' ? 'text-green-600' : 'text-blue-600'}`}
                  >
                    {service.price}
                  </div>
                  <div className="text-gray-500 text-sm">{service.timeline}</div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    service.price === 'БЕСПЛАТНО'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {service.price === 'БЕСПЛАТНО' ? 'Получить аудит' : 'Заказать'}
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      </GridContainer>
    </section>
  )
}
