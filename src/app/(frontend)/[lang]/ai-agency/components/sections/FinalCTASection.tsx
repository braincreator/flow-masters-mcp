'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { ArrowRight, Phone, Mail, MessageCircle } from 'lucide-react'

export function FinalCTASection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-blue-900 text-white">
      <GridContainer>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Готовы изменить
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                свой бизнес?
              </span>
            </h2>
            
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Получите персональную стратегию внедрения ИИ и начните получать результат уже через 14 дней
            </p>

            <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full inline-block font-bold text-lg">
              🎁 Бесплатный аудит + скидка 30% до конца месяца
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold mb-8">Свяжитесь с нами прямо сейчас</h3>
            
            <div className="space-y-6">
              {[
                { icon: Phone, title: 'Позвонить', subtitle: '+7 (999) 123-45-67' },
                { icon: MessageCircle, title: 'Telegram', subtitle: '@ai_agency_bot' },
                { icon: Mail, title: 'Email', subtitle: 'info@ai-agency.ru' }
              ].map((method, index) => {
                const Icon = method.icon
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{method.title}</h4>
                        <p className="text-blue-200">{method.subtitle}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">
              Получить бесплатный аудит
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Ваше имя"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              <input
                type="tel"
                placeholder="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <textarea
                placeholder="Опишите вашу задачу"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg"
              >
                Получить бесплатный аудит
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </motion.button>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Не упустите возможность обогнать конкурентов. 
            <br />
            <span className="text-yellow-400 font-semibold">
              Каждый день промедления = потерянная прибыль.
            </span>
          </p>
        </motion.div>
      </GridContainer>
    </section>
  )
}
