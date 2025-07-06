'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Workflow, Sparkles } from 'lucide-react'

interface MainLayoutSuspenseProps {
  className?: string
  minimal?: boolean
}

export function MainLayoutSuspense({ 
  className,
  minimal = false 
}: MainLayoutSuspenseProps) {
  if (minimal) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}>
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Workflow size={24} className="text-primary" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm text-muted-foreground"
          >
            Loading...
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-gradient-to-br from-background via-background/98 to-background/95",
      "backdrop-blur-sm",
      className
    )}>
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-secondary/10 to-primary/10 blur-3xl"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Logo with rotating border */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-3 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-md"
          />
          <div className="relative bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-lg">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Workflow size={32} className="text-primary" />
            </motion.div>
          </div>
        </div>

        {/* Brand text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.h1
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_100%]"
          >
            Flow Masters
          </motion.h1>
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-xs text-muted-foreground mt-1"
          >
            AI-Powered Solutions
          </motion.p>
        </motion.div>

        {/* Loading bar */}
        <div className="relative w-48 h-1 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            animate={{ x: [-192, 192] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatType: "reverse"
            }}
            className="absolute top-0 w-12 h-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
          />
        </div>

        {/* Floating sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -40, -20],
                x: [0, 10, -10, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
              className={cn(
                "absolute",
                i === 0 && "top-1/4 left-1/3",
                i === 1 && "top-1/3 right-1/3", 
                i === 2 && "bottom-1/3 left-1/2"
              )}
            >
              <Sparkles size={12} className="text-accent/60" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Export a simple skeleton version for SSR
export function MainLayoutSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
        <div className="w-32 h-4 bg-muted rounded animate-pulse" />
        <div className="w-48 h-1 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
