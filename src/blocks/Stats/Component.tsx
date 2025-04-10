'use client'
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { StatsBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { RichText } from '@/components/RichText'
import { cn } from '@/lib/utils'
import { motion, useInView } from 'framer-motion'

type StatsLayout = 'default' | 'grid' | 'inline'
type StatsStyle = 'default' | 'card' | 'minimal'

const layoutStyles: Record<StatsLayout, string> = {
  default: 'grid gap-8 sm:grid-cols-2 lg:grid-cols-4',
  grid: 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3',
  inline: 'flex flex-wrap justify-center gap-8',
}

const styleVariants: Record<StatsStyle, string> = {
  default: '',
  card: 'p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow duration-200',
  minimal: 'p-4 border-l-2 border-primary',
}

interface StatsProps extends StatsBlock {
  className?: string
  layout?: StatsLayout
  style?: StatsStyle
}

const animateValue = (
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void,
) => {
  const startTime = performance.now()

  const update = () => {
    const now = performance.now()
    const progress = Math.min((now - startTime) / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3) // Кубическая функция плавности
    const currentValue = Math.floor(start + (end - start) * easeProgress)

    callback(currentValue)

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

const StatItem: React.FC<{
  label: string
  value: number
  prefix?: string
  suffix?: string
  style?: StatsStyle
}> = ({ label, value, prefix = '', suffix = '', style }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      animateValue(0, value, 1500, setDisplayValue)
    }
  }, [isInView, value])

  return (
    <div ref={ref} className={cn('text-center', styleVariants[style || 'default'])}>
      <div className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>
      <p className="text-base text-muted-foreground">{label}</p>
    </div>
  )
}

export const Stats: React.FC<StatsProps> = ({
  heading,
  description,
  stats,
  settings,
  className,
  layout = 'default',
  style = 'default',
}) => {
  return (
    <GridContainer settings={settings}>
      <div className={cn('w-full py-12', className)}>
        <div className="text-center max-w-3xl mx-auto mb-12 animate-in slide-in-from-bottom-4 duration-700">
          {heading && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{heading}</h2>
          )}
          {description && (
            <div className="text-lg text-muted-foreground">
              <RichText content={description} />
            </div>
          )}
        </div>

        <div
          className={cn(
            layoutStyles[layout],
            'animate-in slide-in-from-bottom-4 duration-700 delay-150',
          )}
        >
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              label={stat.label}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              style={style}
            />
          ))}
        </div>
      </div>
    </GridContainer>
  )
}

export default Stats
