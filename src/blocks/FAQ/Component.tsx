'use client'

import React from 'react'
import { FaqBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const FaqBlock: React.FC<FaqBlock> = ({
  heading,
  subheading,
  items,
  layout = 'accordion',
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

      {/* FAQ content */}
      {layout === 'accordion' && (
        <div className="max-w-3xl mx-auto w-full">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>
                  {typeof item.answer === 'string' ? (
                    <p>{item.answer}</p>
                  ) : (
                    <RichText data={item.answer} />
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <div key={index} className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-xl font-medium mb-4">{item.question}</h3>
              {typeof item.answer === 'string' ? (
                <p className="text-muted-foreground">{item.answer}</p>
              ) : (
                <RichText data={item.answer} />
              )}
            </div>
          ))}
        </div>
      )}
    </GridContainer>
  )
}
