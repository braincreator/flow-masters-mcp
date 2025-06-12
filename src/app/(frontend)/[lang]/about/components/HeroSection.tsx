import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  data: {
    title: string
    subtitle: string
    backgroundImage?: {
      url: string
      alt?: string
    }
  }
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
      role="banner"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Background Image */}
      {data.backgroundImage && (
        <div className="absolute inset-0 opacity-10">
          <Image
            src={data.backgroundImage.url}
            alt={data.backgroundImage.alt || ''}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-foreground leading-tight tracking-tight"
          >
            {data.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {data.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-lg"
              asChild
            >
              <Link href="/contact">
                <span className="relative z-10 flex items-center gap-2">
                  Обсудить проект
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="group border-2 border-primary/20 hover:border-primary/40 text-foreground hover:text-primary px-8 py-4 text-base font-medium rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-background/80 backdrop-blur-sm"
              asChild
            >
              <Link href="/services">
                <span className="flex items-center gap-2">
                  Наши услуги
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary/50 rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
