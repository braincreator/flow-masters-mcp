import React from 'react'
import { motion } from 'framer-motion'
import { Target, Lightbulb, Heart } from 'lucide-react'

import { RichText } from '@/components/RichText'

interface MissionSectionProps {
  data: {
    title: string
    content: any // Rich text content
  }
}

export function MissionSection({ data }: MissionSectionProps) {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl scale-110" />
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {data.title}
            </h2>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Content Card */}
            <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/30 rounded-3xl p-8 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
              {/* Subtle accent line */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />

              {/* Rich Text Content */}
              <div className="prose prose-lg md:prose-xl max-w-none text-center prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed">
                <RichText data={data.content} />
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </motion.div>

          {/* Bottom Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Делаем ИИ простым и доступным для каждого
              </span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
