'use client'

import React from 'react'
import { TimelineBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'
import Image from 'next/image'

export const TimelineBlock: React.FC<TimelineBlock> = ({ heading, items, settings }) => {
  return (
    <GridContainer settings={settings}>
      {/* Section heading */}
      {heading && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">{heading}</h2>
        </div>
      )}

      {/* Timeline items */}
      <div className="relative">
        {/* Vertical line connecting timeline items */}
        <div className="absolute left-0 md:left-1/2 h-full w-0.5 bg-border transform md:-translate-x-1/2" />

        {items.map((item, index) => {
          // Alternate left and right on medium and larger screens
          const isEven = index % 2 === 0

          return (
            <div
              key={index}
              className={cn(
                'relative mb-16 last:mb-0 flex flex-col gap-4 md:flex-row md:gap-8',
                isEven ? 'md:flex-row' : 'md:flex-row-reverse',
              )}
            >
              {/* Date badge */}
              <div className="md:w-1/2 flex justify-center md:justify-end items-start">
                <div className="flex gap-4 md:flex-row-reverse">
                  {/* Date chip */}
                  {item.date && (
                    <div className="relative z-10 bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium">
                      {item.date}
                    </div>
                  )}

                  {/* Timeline dot */}
                  <div className="relative">
                    <div className="absolute -left-2 md:left-0 top-1.5 w-4 h-4 rounded-full bg-primary transform md:-translate-x-1/2" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                className={cn(
                  'md:w-1/2 p-6 rounded-lg border border-border bg-card relative',
                  isEven ? 'md:ml-6' : 'md:mr-6',
                )}
              >
                {/* Content header */}
                <h3 className="text-xl font-medium mb-4">{item.title}</h3>

                {/* Description */}
                {item.description && (
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                )}

                {/* Media */}
                {item.media && (
                  <div className="mt-4 rounded-md overflow-hidden">
                    <Image
                      src={item.media.url}
                      alt={item.media.alt || item.title}
                      width={item.media.width || 500}
                      height={item.media.height || 300}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </GridContainer>
  )
}
