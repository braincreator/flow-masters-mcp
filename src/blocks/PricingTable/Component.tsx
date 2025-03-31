'use client'

import React from 'react'
import { PricingTableBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'
import { Action } from '@/components/Action'
import { Check } from 'lucide-react'

export const PricingTableBlock: React.FC<PricingTableBlock> = ({
  heading,
  subheading,
  plans,
  settings,
}) => {
  return (
    <GridContainer settings={settings}>
      {/* Section heading */}
      {(heading || subheading) && (
        <div className="text-center mb-12">
          {heading && <h2 className="text-3xl font-bold mb-4">{heading}</h2>}
          {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col p-6 rounded-lg border bg-card h-full',
              plan.isPopular
                ? 'border-primary shadow-md shadow-primary/10 relative'
                : 'border-border',
            )}
          >
            {/* Popular badge */}
            {plan.isPopular && (
              <div className="absolute -top-3 right-6 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}

            {/* Plan name and price */}
            <div className="mb-5">
              <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.interval && <span className="text-muted-foreground">/{plan.interval}</span>}
              </div>
              {plan.description && <p className="mt-2 text-muted-foreground">{plan.description}</p>}
            </div>

            {/* Features list */}
            {plan.features && plan.features.length > 0 && (
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Plan actions */}
            {plan.actions && plan.actions.length > 0 && (
              <div className="mt-auto pt-4 flex flex-col gap-2">
                {plan.actions.map((action, i) => (
                  <Action
                    key={i}
                    {...action}
                    variant={plan.isPopular ? 'primary' : 'outline'}
                    className="w-full justify-center"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </GridContainer>
  )
}
