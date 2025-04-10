"use client"
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { BaseBlock } from '@/components/BaseBlock'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Play, Maximize2 } from 'lucide-react'
import type { MediaBlock as MediaBlockType } from '@/types/blocks'
import type { BlockStyleProps } from '@/types/block-styles'
import { blockSizeStyles, blockStyleVariants, blockAnimationStyles } from '@/styles/block-styles'
import { cn } from '@/lib/utils'

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[16/10]',
  ultra: 'aspect-[21/9]',
}

const layoutStyles = {
  full: 'container-full',
  contained: 'container mx-auto px-4',
  split: 'grid md:grid-cols-2 gap-8 items-center container mx-auto px-4',
}

interface MediaProps extends MediaBlockType, BlockStyleProps {
  expandable?: boolean
}

export const Media: React.FC<MediaProps> = ({
  media,
  caption,
  settings,
  className,
  style = 'default',
  size = 'md',
  layout = 'contained',
  ratio = 'wide',
  expandable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const sizeVariant = blockSizeStyles[size]
  const styleVariant = blockStyleVariants[style]

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPlaying(true)
  }

  const renderMedia = (inModal = false) => (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        aspectRatios[ratio],
        blockAnimationStyles.fadeIn,
      )}
    >
      {media.type === 'image' ? (
        <>
          <Image
            src={media.url}
            alt={media.alt || ''}
            fill
            className="object-cover"
            sizes={layout === 'full' ? '100vw' : '(min-width: 768px) 50vw, 100vw'}
            priority={inModal}
          />
          {!inModal && expandable && (
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => setIsOpen(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <div className="relative h-full">
          {!isPlaying ? (
            <>
              <Image src={media.alt || ''} alt="Video thumbnail" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/90 hover:bg-white"
                  onClick={handlePlayClick}
                >
                  <Play className="h-6 w-6" />
                </Button>
              </div>
            </>
          ) : (
            <video src={media.url} className="h-full w-full" controls autoPlay playsInline />
          )}
        </div>
      )}
    </div>
  )

  const captionContent = caption && (
    <figcaption className={cn('mt-3 text-center italic', sizeVariant.content)}>
      {caption}
    </figcaption>
  )

  return (
    <BaseBlock settings={settings}>
      <figure
        className={cn(
          layoutStyles[layout],
          styleVariant.background,
          styleVariant.text,
          styleVariant.border,
          styleVariant.shadow,
          sizeVariant.container,
          className,
        )}
      >
        {layout === 'split' ? (
          <>
            <div>{renderMedia()}</div>
            <div className="space-y-4">{captionContent}</div>
          </>
        ) : (
          <>
            {renderMedia()}
            {captionContent}
          </>
        )}
      </figure>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-lg p-0">
          <div className="aspect-video">{renderMedia(true)}</div>
          {caption && <div className="p-4">{captionContent}</div>}
        </DialogContent>
      </Dialog>
    </BaseBlock>
  )
}

export const MediaBlock = Media
export default Media
