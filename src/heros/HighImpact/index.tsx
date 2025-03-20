'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  return (
    <div className="relative -mt-[10.4rem] min-h-[80vh] flex items-center justify-center">
      {/* Hero Image */}
      <div className="absolute inset-0 w-full h-full">
        {media && typeof media === 'object' && (
          <Media
            resource={media}
            fill
            priority
            className="absolute inset-0"
            imgClassName="object-cover"
            sizes="100vw"
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 text-white">
        <div className="max-w-[36.5rem] mx-auto text-center">
          {richText && (
            <RichText 
              className="mb-6 prose prose-invert mx-auto" 
              data={richText} 
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex justify-center gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
