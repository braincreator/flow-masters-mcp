"use client"
import React, { useState } from 'react'
import { GridContainer } from '@/components/GridContainer'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight } from 'lucide-react'
import type { StepsBlock as StepsBlockType } from '@/types/blocks'
import { cn } from '@/lib/utils'

type StepsLayout = 'vertical' | 'horizontal' | 'cards'
type StepsStyle = 'default' | 'numbered' | 'minimal'

const layoutStyles: Record<StepsLayout, string> = {
  vertical: 'flex flex-col gap-8',
  horizontal: 'grid grid-cols-1 md:grid-cols-3 gap-8',
  cards: 'grid grid-cols-1 md:grid-cols-3 gap-8',
}

const styleVariants: Record<StepsStyle, string> = {
  default: '',
  numbered: 'relative pl-12',
  minimal: 'border-l-2 border-muted pl-6',
}

interface StepsProps extends StepsBlockType {
  className?: string
  layout?: StepsLayout
  style?: StepsStyle
}

const StepItem: React.FC<{
  step: {
    title: string
    description: string
    isCompleted?: boolean
  }
  index: number
  isActive: boolean
  style: StepsStyle
  layout: StepsLayout
  onClick: () => void
}> = ({ step, index, isActive, style, layout, onClick }) => {
  return (
    <div
      className={cn(
        'group relative',
        styleVariants[style],
        layout === 'cards' &&
          'p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-200',
        'animate-in slide-in-from-bottom-4 duration-700',
        { 'delay-150': index === 1, 'delay-300': index === 2 },
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {style === 'numbered' && (
        <div
          className={cn(
            'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium',
            isActive
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30',
          )}
        >
          {step.isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
        </div>
      )}

      <div className="space-y-2">
        <h3 className={cn('text-xl font-semibold', isActive && 'text-primary')}>{step.title}</h3>
        <div className="text-muted-foreground">
          <RichText content={step.description} />
        </div>
      </div>

      {layout === 'horizontal' && index < 2 && (
        <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2">
          <ChevronRight className="h-6 w-6 text-muted-foreground/30" />
        </div>
      )}
    </div>
  )
}

export const Steps: React.FC<StepsProps> = ({
  heading,
  description,
  steps,
  settings,
  className,
  layout = 'vertical',
  style = 'numbered',
}) => {
  const [activeStep, setActiveStep] = useState(0)

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

        <div className={cn(layoutStyles[layout])}>
          {steps.map((step, index) => (
            <StepItem
              key={index}
              step={step}
              index={index}
              isActive={index === activeStep}
              style={style}
              layout={layout}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </GridContainer>
  )
}

export const StepsBlock = Steps
export default Steps
