import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Award, Users, Clock } from 'lucide-react'

interface StatsSectionProps {
  data: {
    title: string
    subtitle?: string
    items: Array<{
      value: string
      label: string
      description?: string
      icon?: string
    }>
  }
}

const iconMap = {
  'trending-up': TrendingUp,
  award: Award,
  users: Users,
  clock: Clock,
}

export function StatsSection({ data }: StatsSectionProps) {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.items.map((stat, index) => {
            const IconComponent = stat.icon
              ? iconMap[stat.icon as keyof typeof iconMap] || TrendingUp
              : TrendingUp

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/30 rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/40 overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(circle at 20px 20px, currentColor 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                      }}
                    />
                  </div>

                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                    className="relative z-10 flex justify-center mb-8"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500">
                      <IconComponent className="w-10 h-10 text-primary" />
                    </div>
                  </motion.div>

                  {/* Value */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                    className="relative z-10 mb-6"
                  >
                    <div className="text-5xl md:text-6xl font-bold text-foreground mb-3 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold text-primary uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </motion.div>

                  {/* Description */}
                  {stat.description && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                      viewport={{ once: true }}
                      className="relative z-10 text-sm text-muted-foreground leading-relaxed"
                    >
                      {stat.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-primary" />
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
