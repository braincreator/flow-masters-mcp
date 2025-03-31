'use client'

import React, { useState } from 'react'
import { VideoBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import Image from 'next/image'
import { Play } from 'lucide-react'

export const VideoBlock: React.FC<VideoBlock> = ({
  videoUrl,
  videoType = 'youtube',
  thumbnailUrl,
  autoplay = false,
  muted = true,
  loop = false,
  caption,
  settings,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay)

  // Get video ID for embed URLs
  const getYouTubeId = (url: string) => {
    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getVimeoId = (url: string) => {
    // Handle different Vimeo URL formats
    const regExp = /vimeo\.com\/(?:.*\/)?(?:videos\/)?([0-9]+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  // Build embed URL
  const getEmbedUrl = () => {
    if (videoType === 'youtube') {
      const videoId = getYouTubeId(videoUrl)
      if (!videoId) return null

      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&rel=0`
    } else if (videoType === 'vimeo') {
      const videoId = getVimeoId(videoUrl)
      if (!videoId) return null

      return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&loop=${loop ? 1 : 0}`
    }

    // For custom videos, just return the URL
    return videoUrl
  }

  const embedUrl = getEmbedUrl()

  // Handle click on video thumbnail
  const handlePlayClick = () => {
    setIsPlaying(true)
  }

  return (
    <GridContainer settings={settings}>
      <div className="w-full flex flex-col items-center">
        <div className="w-full relative rounded-lg overflow-hidden aspect-video">
          {isPlaying && embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          ) : (
            <div className="relative w-full h-full cursor-pointer" onClick={handlePlayClick}>
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={caption || 'Video thumbnail'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="h-16 w-16 text-muted-foreground opacity-50" />
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/80 rounded-full p-3 shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Play className="h-8 w-8" />
                </div>
              </div>
            </div>
          )}
        </div>

        {caption && <p className="mt-2 text-sm text-muted-foreground text-center">{caption}</p>}
      </div>
    </GridContainer>
  )
}
