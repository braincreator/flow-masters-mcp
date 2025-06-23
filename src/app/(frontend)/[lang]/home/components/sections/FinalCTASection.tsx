'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GridContainer } from '@/components/GridContainer'
import { ArrowRight, Phone, Mail, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function FinalCTASection() {
  const t = useTranslations('aiAgency.finalCta.form')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          actionType: 'final-cta-form',
          source: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error(t('buttons.submitting'))
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(t('buttons.submitting'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="final-cta" className="py-20 bg-gradient-to-b from-slate-900 to-blue-900 text-white">
      <GridContainer>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              {t('title')}
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('titleHighlight')}
              </span>
            </h2>

            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-8">{t('subtitle')}</p>

            <div className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full inline-block font-bold text-lg">
              {t('offer')}
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
            <h3 className="text-3xl font-bold mb-8">{t('contactTitle')}</h3>

            <div className="space-y-6">
              {[
                // Временно закомментирован телефон
                // {
                //   icon: Phone,
                //   title: t('contactMethods.phone.title'),
                //   subtitle: t('contactMethods.phone.subtitle'),
                // },
                {
                  icon: MessageCircle,
                  title: t('contactMethods.telegram.title'),
                  subtitle: t('contactMethods.telegram.subtitle'),
                  href: 'https://t.me/flow_masters_bot?start=lead_form',
                },
                {
                  icon: Mail,
                  title: t('contactMethods.email.title'),
                  subtitle: t('contactMethods.email.subtitle'),
                  href: 'mailto:admin@flow-masters.ru',
                },
              ].map((method, index) => {
                const Icon = method.icon
                const ContactComponent = method.href ? 'a' : 'div'
                const contactProps = method.href
                  ? {
                      href: method.href,
                      target: method.href.startsWith('https://') ? '_blank' : undefined,
                      rel: method.href.startsWith('https://') ? 'noopener noreferrer' : undefined,
                    }
                  : {}

                return (
                  <ContactComponent
                    key={index}
                    {...contactProps}
                    className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 block ${
                      method.href
                        ? 'hover:bg-white/20 transition-all duration-300 cursor-pointer'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{method.title}</h4>
                        <p className="text-blue-200">{method.subtitle}</p>
                      </div>
                    </div>
                  </ContactComponent>
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
            <h3 className="text-2xl font-bold mb-6 text-center">{t('formTitle')}</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder={t('fields.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="tel"
                placeholder={t('fields.phone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="email"
                placeholder={t('fields.email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder={t('fields.message')}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <motion.button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                whileHover={{ scale: isSubmitting || isSubmitted ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting || isSubmitted ? 1 : 0.95 }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  isSubmitted
                    ? 'bg-green-600 text-white'
                    : isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {isSubmitted ? (
                  <>{t('buttons.submitted')}</>
                ) : isSubmitting ? (
                  <>{t('buttons.submitting')}</>
                ) : (
                  <>
                    {t('buttons.submit')}
                    <ArrowRight className="ml-2 h-5 w-5 inline" />
                  </>
                )}
              </motion.button>
            </form>

            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-green-600/20 border border-green-500/30 rounded-xl"
              >
                <h4 className="text-xl font-bold text-green-400 mb-3">{t('success.title')}</h4>
                <p className="text-green-100 mb-4">{t('success.description')}</p>
                <div className="bg-blue-600/30 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-100 text-sm mb-2">{t('success.telegramText')}</p>
                  <a
                    href="https://t.me/flow_masters_bot?start=lead_form"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 font-semibold"
                  >
                    {t('success.telegramLink')}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            )}
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
            {t('finalMessage')}
            <br />
            <span className="text-yellow-400 font-semibold">{t('finalUrgency')}</span>
          </p>
        </motion.div>
      </GridContainer>
    </section>
  )
}
