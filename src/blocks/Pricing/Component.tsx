"use client"
'use client'

import React, { useState } from 'react'
import { PricingBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring', stiffness: 100 },
}

export const Pricing: React.FC<PricingBlock> = ({ heading, description, plans, settings }) => {
  const [isAnnual, setIsAnnual] = useState(true)

  const getPrice = (plan) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <GridContainer settings={settings}>
      <div className="space-y-12">
        {(heading || description) && (
          <motion.div className="text-center max-w-3xl mx-auto space-y-4" {...fadeInUp}>
            {heading && <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button variant={isAnnual ? 'ghost' : 'outline'} onClick={() => setIsAnnual(false)}>
                Monthly
              </Button>
              <Button variant={isAnnual ? 'outline' : 'ghost'} onClick={() => setIsAnnual(true)}>
                Annually
                <span className="ml-1.5 text-xs text-primary">Save 20%</span>
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={cn(
                'relative rounded-2xl border bg-card p-8',
                plan.featured && 'border-primary shadow-lg',
              )}
              {...scaleIn}
              transition={{ delay: index * 0.1 }}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  {plan.description && (
                    <p className="mt-2 text-muted-foreground">{plan.description}</p>
                  )}
                </div>

                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{getPrice(plan)}</span>
                  <span className="ml-2 text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
                </div>

                <Button
                  className="w-full"
                  variant={plan.featured ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.buttonText || 'Get Started'}
                </Button>

                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                      >
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GridContainer>
  )
}

export const PricingBlock = Pricing
export default Pricing
