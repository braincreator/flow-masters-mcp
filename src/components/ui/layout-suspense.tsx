'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { 
  Sparkles, 
  Zap, 
  Brain, 
  Cpu, 
  Network,
  Bot,
  Workflow,
  Layers
} from 'lucide-react'

interface LayoutSuspenseProps {
  children?: React.ReactNode
  className?: string
  showLogo?: boolean
  message?: string
}

const FloatingIcon = ({ 
  icon: Icon, 
  delay = 0, 
  duration = 3,
  className = "",
  size = 20
}: {
  icon: React.ElementType
  delay?: number
  duration?: number
  className?: string
  size?: number
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: -180 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0, 1.2, 1, 0],
      rotate: [0, 180, 360],
      y: [-20, -40, -60, -80]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeInOut"
    }}
    className={cn("absolute", className)}
  >
    <Icon size={size} className="text-primary/60" />
  </motion.div>
)

const PulsingOrb = ({ 
  size = 100, 
  delay = 0,
  className = ""
}: {
  size?: number
  delay?: number
  className?: string
}) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1, 1.2, 1],
      opacity: [0, 0.3, 0.6, 0.3]
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={cn(
      "absolute rounded-full blur-xl",
      "bg-gradient-to-r from-primary/20 via-accent/30 to-secondary/20",
      className
    )}
    style={{ width: size, height: size }}
  />
)

const NeuralNetwork = () => {
  const nodes = [
    { x: 20, y: 30 },
    { x: 50, y: 20 },
    { x: 80, y: 40 },
    { x: 30, y: 60 },
    { x: 70, y: 70 },
    { x: 50, y: 80 }
  ]

  return (
    <svg 
      className="absolute inset-0 w-full h-full opacity-20" 
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Connections */}
      {nodes.map((node, i) => 
        nodes.slice(i + 1).map((targetNode, j) => (
          <motion.line
            key={`${i}-${j}`}
            x1={node.x}
            y1={node.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/30"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{
              duration: 2,
              delay: (i + j) * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1
            }}
          />
        ))
      )}
      
      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.x}
          cy={node.y}
          r="2"
          fill="currentColor"
          className="text-accent"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 1.5, 1],
            opacity: [0, 1, 0.8, 1]
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
      ))}
    </svg>
  )
}

export function LayoutSuspense({ 
  children, 
  className,
  showLogo = true,
  message = "Initializing Flow Masters..."
}: LayoutSuspenseProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-muted rounded-md" />
        </div>
      </div>
    )
  }

  const icons = [Brain, Cpu, Network, Bot, Workflow, Layers, Zap, Sparkles]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          "bg-gradient-to-br from-background via-background/95 to-background/90",
          "backdrop-blur-sm",
          className
        )}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Orbs */}
          <PulsingOrb size={200} delay={0} className="top-1/4 left-1/4" />
          <PulsingOrb size={150} delay={0.5} className="top-3/4 right-1/4" />
          <PulsingOrb size={100} delay={1} className="top-1/2 right-1/3" />
          
          {/* Neural Network Background */}
          <div className="absolute inset-0">
            <NeuralNetwork />
          </div>
          
          {/* Floating Icons */}
          {icons.map((Icon, i) => (
            <FloatingIcon
              key={i}
              icon={Icon}
              delay={i * 0.3}
              duration={3 + (i % 3)}
              className={`
                ${i % 4 === 0 ? 'top-1/4 left-1/5' : ''}
                ${i % 4 === 1 ? 'top-1/3 right-1/5' : ''}
                ${i % 4 === 2 ? 'bottom-1/3 left-1/3' : ''}
                ${i % 4 === 3 ? 'bottom-1/4 right-1/3' : ''}
              `}
              size={16 + (i % 3) * 4}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center space-y-8 px-8">
          {/* Logo/Brand */}
          {showLogo && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.2 
              }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-lg"
                />
                <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Workflow size={48} className="text-primary" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading Animation */}
          <div className="relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
              style={{ width: 200 }}
            />
            <motion.div
              animate={{ x: [-20, 220] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatType: "reverse"
              }}
              className="absolute top-0 w-4 h-1 bg-white/80 rounded-full blur-sm"
            />
          </div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center space-y-2"
          >
            <motion.h2
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              Flow Masters
            </motion.h2>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-muted-foreground text-sm"
            >
              {message}
            </motion.p>
          </motion.div>

          {/* Dots Indicator */}
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 rounded-full bg-primary/60"
              />
            ))}
          </div>
        </div>

        {children}
      </motion.div>
    </AnimatePresence>
  )
}
