import React from 'react'
import Image from 'next/image'
import { FeaturesBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/lib/utils'

export default function FeaturesBlock({
  heading,
  subheading,
  description,
  features,
  layout = 'grid',
  settings,
}: FeaturesBlock) {
  if (!features || features.length === 0) {
    return null
  }

  const getGridColumns = () => {
    const count = features.length
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 3) return 'grid-cols-1 md:grid-cols-3'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  const renderFeatures = () => {
    switch (layout) {
      case 'list':
        return (
          <div className="space-y-10">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                {feature.media && (
                  <div className="flex-shrink-0 w-full md:w-1/3">
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                      <Image
                        src={feature.media.url}
                        alt={feature.media.alt || feature.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className={cn('flex-1', !feature.media && 'md:ml-12')}>
                  {feature.icon && (
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                      <span className="text-xl">{feature.icon}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  {feature.description && (
                    <p className="text-muted-foreground">{feature.description}</p>
                  )}
                  {feature.action && (
                    <a
                      href={feature.action.href}
                      className={cn(
                        'inline-flex items-center mt-4 text-sm font-medium',
                        feature.action.style === 'primary' && 'text-primary',
                      )}
                      target={feature.action.isExternal ? '_blank' : undefined}
                      rel={feature.action.isExternal ? 'noopener noreferrer' : undefined}
                    >
                      {feature.action.label}
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )

      case 'cards':
        return (
          <div className={cn('grid gap-6', getGridColumns())}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card text-card-foreground rounded-lg shadow-sm p-6 h-full flex flex-col"
              >
                {feature.media && (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src={feature.media.url}
                      alt={feature.media.alt || feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {feature.icon && !feature.media && (
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                {feature.description && (
                  <p className="text-muted-foreground flex-1">{feature.description}</p>
                )}
                {feature.action && (
                  <a
                    href={feature.action.href}
                    className={cn(
                      'inline-flex items-center mt-4 text-sm font-medium',
                      feature.action.style === 'primary' && 'text-primary',
                    )}
                    target={feature.action.isExternal ? '_blank' : undefined}
                    rel={feature.action.isExternal ? 'noopener noreferrer' : undefined}
                  >
                    {feature.action.label}
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )

      case 'grid':
      default:
        return (
          <div className={cn('grid gap-10 md:gap-8', getGridColumns())}>
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col">
                {feature.media && (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
                    <Image
                      src={feature.media.url}
                      alt={feature.media.alt || feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {feature.icon && !feature.media && (
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                {feature.description && (
                  <p className="text-muted-foreground">{feature.description}</p>
                )}
                {feature.action && (
                  <a
                    href={feature.action.href}
                    className={cn(
                      'inline-flex items-center mt-4 text-sm font-medium',
                      feature.action.style === 'primary' && 'text-primary',
                    )}
                    target={feature.action.isExternal ? '_blank' : undefined}
                    rel={feature.action.isExternal ? 'noopener noreferrer' : undefined}
                  >
                    {feature.action.label}
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )
    }
  }

  return (
    <GridContainer settings={settings}>
      {/* Header section */}
      {(heading || subheading || description) && (
        <div className="text-center mb-12 max-w-3xl mx-auto">
          {subheading && (
            <p className="text-sm font-medium uppercase tracking-wider text-primary mb-2">
              {subheading}
            </p>
          )}
          {heading && (
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">{heading}</h2>
          )}
          {description && <p className="text-muted-foreground text-lg">{description}</p>}
        </div>
      )}

      {/* Features section */}
      {renderFeatures()}
    </GridContainer>
  )
}
