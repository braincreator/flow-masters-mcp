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
              <div key={index} className="relative mb-16 lg:mb-20">
                {/* Step Card */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1">
                    <div className="relative bg-gradient-to-br from-card/90 to-card/60 dark:from-card/95 dark:to-card/70 backdrop-blur-md border border-border/50 dark:border-border/70 rounded-3xl p-8 hover:shadow-2xl dark:hover:shadow-primary/5 transition-all duration-500 hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/60 group overflow-hidden">
                      {/* Top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Step Number - better contrast for both themes */}
                      <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-primary to-primary/90 dark:from-primary dark:to-primary/80 rounded-br-xl flex items-center justify-center text-primary-foreground font-bold text-sm shadow-xl dark:shadow-primary/20 border border-primary/20 dark:border-primary/30">
                        {index + 1}
                      </div>

                      {/* Content - with top-left padding to avoid overlap */}
                      <div className="relative z-10 pt-2 pl-2">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground/90 dark:text-muted-foreground/80 leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Bottom accent */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/60 dark:via-primary/70 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                      <div className="w-24 h-24 bg-gradient-to-br from-primary/25 to-primary/15 dark:from-primary/30 dark:to-primary/20 rounded-2xl flex items-center justify-center border-4 border-primary/30 dark:border-primary/40 shadow-xl dark:shadow-primary/10">
                        <IconComponent className="w-12 h-12 text-primary dark:text-primary" />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Connection Line - Desktop */}
                {!isLast && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                    viewport={{ once: true }}
                    className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/30 dark:from-primary/80 dark:via-primary/60 dark:to-primary/40 rounded-full z-10"
                    style={{
                      originY: 0,
                      top: '100%',
                      height: '60px',
                      marginTop: '8px',
                    }}
                  />
                )}

                {/* Arrow for mobile and tablet */}
                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.7 }}
                    viewport={{ once: true }}
                    className="flex justify-center my-6 lg:hidden"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-primary/70 to-primary/30 dark:from-primary/80 dark:to-primary/40 rounded-full" />
                      <ArrowRight className="w-6 h-6 text-primary/70 dark:text-primary/80 rotate-90" />
                      <div className="w-1 h-8 bg-gradient-to-b from-primary/30 to-primary/70 dark:from-primary/40 dark:to-primary/80 rounded-full" />
                    </div>
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
          <div className="max-w-2xl mx-auto bg-card/40 dark:bg-card/60 backdrop-blur-sm border border-border/60 dark:border-border/80 rounded-2xl p-8 shadow-lg dark:shadow-primary/5">
            <h3 className="text-xl font-bold mb-4 text-foreground">Готовы начать?</h3>
            <p className="text-muted-foreground/90 dark:text-muted-foreground/80 mb-6 leading-relaxed">
              Каждый проект уникален, но наш подход остается неизменным: глубокое понимание ваших
              потребностей и создание решений, которые действительно работают.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary dark:text-primary">
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
