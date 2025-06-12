import React from 'react'
import { motion } from 'framer-motion'
import { Linkedin, Mail, MessageCircle, ExternalLink, User } from 'lucide-react'
import Image from 'next/image'

import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'

interface FounderSectionProps {
  data: {
    title: string
    name: string
    role: string
    bio: any // Rich text content
    photo?: {
      url: string
      alt?: string
    }
    socialLinks?: {
      linkedin?: string
      telegram?: string
      email?: string
      website?: string
    }
  }
}

export function FounderSection({ data }: FounderSectionProps) {
  const socialIcons = {
    linkedin: Linkedin,
    telegram: MessageCircle,
    email: Mail,
    website: ExternalLink,
  }

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-primary/5" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

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
        </motion.div>

        {/* Founder Card */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-12 shadow-xl"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: '30px 30px',
                }}
              />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex justify-center lg:justify-start"
              >
                <div className="relative">
                  {data.photo ? (
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl relative">
                      <Image
                        src={data.photo.url}
                        alt={data.photo.alt || data.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 192px, 192px"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-primary/20 shadow-xl flex items-center justify-center">
                      <User className="w-24 h-24 text-primary/60" />
                    </div>
                  )}

                  {/* Decorative Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* Status Indicator */}
                  <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 rounded-full border-4 border-background shadow-lg">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="lg:col-span-2 text-center lg:text-left">
                {/* Name & Role */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    {data.name}
                  </h3>
                  <p className="text-lg text-primary font-semibold">{data.role}</p>
                </motion.div>

                {/* Bio */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="mb-8"
                >
                  <div className="prose prose-lg max-w-none text-muted-foreground">
                    <RichText data={data.bio} />
                  </div>
                </motion.div>

                {/* Social Links */}
                {data.socialLinks && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap gap-4 justify-center lg:justify-start"
                  >
                    {Object.entries(data.socialLinks).map(([platform, url]) => {
                      if (!url) return null

                      const IconComponent =
                        socialIcons[platform as keyof typeof socialIcons] || ExternalLink

                      return (
                        <Button
                          key={platform}
                          variant="outline"
                          size="sm"
                          className="group border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                          asChild
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <IconComponent className="w-4 h-4 transition-transform group-hover:scale-110" />
                            <span className="capitalize">{platform}</span>
                          </a>
                        </Button>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
            <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
          </motion.div>
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <blockquote className="text-lg md:text-xl italic text-muted-foreground border-l-4 border-primary/30 pl-6">
              "Технологии должны служить людям, а не наоборот. Моя цель — сделать ИИ понятным и
              полезным для каждого бизнеса."
            </blockquote>
            <cite className="block mt-4 text-sm font-semibold text-primary">— {data.name}</cite>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
