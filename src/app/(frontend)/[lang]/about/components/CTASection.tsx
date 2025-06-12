import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Calendar, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface CTASectionProps {
  data: {
    title: string
    subtitle?: string
    primaryButton: {
      text: string
      url: string
    }
    secondaryButton?: {
      text: string
      url: string
    }
  }
}

export function CTASection({ data }: CTASectionProps) {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/30 rounded-3xl p-8 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden"
          >
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative z-10 flex justify-center mb-8"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl scale-110" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground tracking-tight"
            >
              {data.title}
            </motion.h2>

            {/* Subtitle */}
            {data.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative z-10 text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                {data.subtitle}
              </motion.p>
            )}

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-lg"
                asChild
              >
                <Link href={data.primaryButton.url}>
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {data.primaryButton.text}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </Button>

              {data.secondaryButton && (
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-2 border-primary/20 hover:border-primary/40 text-foreground hover:text-primary px-8 py-4 text-base font-medium rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-background/80 backdrop-blur-sm"
                  asChild
                >
                  <Link href={data.secondaryButton.url}>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {data.secondaryButton.text}
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
            >
              {[
                'Бесплатная консультация',
                'Анализ ваших процессов',
                'Расчет ROI от автоматизации',
                'План внедрения',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </motion.div>

          {/* Bottom Note */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <p className="text-sm text-muted-foreground">
              Обычно отвечаем в течение 2-3 рабочих часов
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
