import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Target, Lightbulb, TrendingUp, Heart, Zap } from 'lucide-react'

interface ValuesSectionProps {
  data: {
    title: string
    subtitle?: string
    items: Array<{
      title: string
      description: string
      icon?: string
    }>
  }
}

const iconMap = {
  'shield-check': Shield,
  target: Target,
  lightbulb: Lightbulb,
  'trending-up': TrendingUp,
  heart: Heart,
  zap: Zap,
}

export function ValuesSection({ data }: ValuesSectionProps) {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.items.map((value, index) => {
            const IconComponent = value.icon
              ? iconMap[value.icon as keyof typeof iconMap] || Lightbulb
              : Lightbulb

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/30">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                    className="relative z-10 mb-6"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 mx-auto">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                      className="text-xl font-bold mb-4 text-foreground"
                    >
                      {value.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                      viewport={{ once: true }}
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      {value.description}
                    </motion.p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full" />
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-secondary/30 rounded-full" />

                  {/* Hover Effect Lines */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 left-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent transform -translate-x-1/2" />
                    <div className="absolute bottom-0 left-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent transform -translate-x-1/2" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="max-w-3xl mx-auto bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 text-foreground">Почему это важно?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Наши принципы — это не просто слова. Они определяют каждое решение, которое мы
              принимаем, каждый проект, который мы реализуем, и каждое взаимодействие с клиентами.
              Мы верим, что только следуя этим ценностям, можно создавать по-настоящему полезные
              ИИ-решения.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
