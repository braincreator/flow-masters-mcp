import React from 'react'
import { motion } from 'framer-motion'
import { Search, Target, Wrench, BarChart3, ArrowRight } from 'lucide-react'

interface ApproachSectionProps {
  data: {
    title: string
    subtitle?: string
    steps: Array<{
      title: string
      description: string
      icon?: string
    }>
  }
}

const iconMap = {
  search: Search,
  strategy: Target,
  implementation: Wrench,
  optimization: BarChart3,
}

export function ApproachSection({ data }: ApproachSectionProps) {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5" />

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

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {data.steps.map((step, index) => {
            const IconComponent = step.icon
              ? iconMap[step.icon as keyof typeof iconMap] || Search
              : Search
            const isLast = index === data.steps.length - 1

            return (
              <div key={index} className="relative">
                {/* Step Card */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`flex flex-col lg:flex-row items-center gap-8 mb-12 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1">
                    <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-primary/30 group">
                      {/* Background Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Step Number */}
                      <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>

                      {/* Decorative Corner */}
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
                    </div>
                  </div>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20 shadow-lg">
                        <IconComponent className="w-10 h-10 text-primary" />
                      </div>

                      {/* Static Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Connection Line */}
                {!isLast && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                    className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-primary/50 to-secondary/50 -bottom-4 z-10"
                    style={{ originY: 0 }}
                  />
                )}

                {/* Arrow for mobile */}
                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.7 }}
                    viewport={{ once: true }}
                    className="flex justify-center mb-4 md:hidden"
                  >
                    <ArrowRight className="w-6 h-6 text-primary/60 rotate-90" />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="max-w-2xl mx-auto bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 text-foreground">Готовы начать?</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Каждый проект уникален, но наш подход остается неизменным: глубокое понимание ваших
              потребностей и создание решений, которые действительно работают.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Результат гарантирован на каждом этапе
              </span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
