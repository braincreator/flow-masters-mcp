'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Подойдет ли ИИ для моего бизнеса?',
    answer: 'ИИ подходит для 95% бизнесов. Если у вас есть повторяющиеся процессы, общение с клиентами или обработка данных — ИИ точно поможет.'
  },
  {
    question: 'Почему такая цена? Это дорого!',
    answer: 'Цена окупается за 2-3 месяца. Один ИИ-ассистент заменяет 3-5 сотрудников, работает 24/7 и увеличивает продажи на 30-50%.'
  },
  {
    question: 'Почему нужна предоплата?',
    answer: 'Предоплата нужна для резервирования ресурсов команды. Мы создаем персональное решение под ваш бизнес, что требует времени экспертов.'
  },
  {
    question: 'А если ИИ не принесет результат?',
    answer: 'Даем гарантию результата! Если в течение 60 дней ИИ не принесет улучшений — возвращаем 100% предоплаты.'
  }
]

export function AIFAQSection() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)

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
              Отвечаем на все сомнения
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Самые частые вопросы и честные ответы о внедрении ИИ в бизнес
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openQuestion === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openQuestion === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </GridContainer>
    </section>
  )
}
