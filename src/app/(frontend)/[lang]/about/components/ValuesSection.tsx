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
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/8 to-background dark:via-primary/12" />

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
                <div className="relative h-full bg-gradient-to-br from-card/90 to-card/60 dark:from-card/95 dark:to-card/70 backdrop-blur-md border border-border/50 dark:border-border/70 rounded-3xl p-8 hover:shadow-2xl dark:hover:shadow-primary/5 transition-all duration-500 hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/60 overflow-hidden">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                    className="relative z-10 mb-6"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/25 to-primary/15 dark:from-primary/30 dark:to-primary/20 rounded-2xl flex items-center justify-center shadow-lg dark:shadow-primary/10 group-hover:shadow-xl dark:group-hover:shadow-primary/15 transition-all duration-500 mx-auto border border-primary/20 dark:border-primary/30">
                      <IconComponent className="w-10 h-10 text-primary" />
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
                      className="text-2xl font-bold mb-4 text-foreground tracking-tight"
                    >
                      {value.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                      viewport={{ once: true }}
                      className="text-sm text-muted-foreground/90 dark:text-muted-foreground/80 leading-relaxed"
                    >
                      {value.description}
                    </motion.p>
                  </div>

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/60 dark:via-primary/70 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
          <div className="max-w-3xl mx-auto bg-card/40 dark:bg-card/60 backdrop-blur-sm border border-border/60 dark:border-border/80 rounded-2xl p-8 shadow-lg dark:shadow-primary/5">
            <h3 className="text-xl font-bold mb-4 text-foreground">Почему это важно?</h3>
            <p className="text-muted-foreground/90 dark:text-muted-foreground/80 leading-relaxed">
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
