'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { GridContainer } from '@/components/GridContainer'
import { AudioBlock } from '@/types/blocks'
import { cn } from '@/lib/utils'

export const AudioBlock: React.FC<AudioBlock> = ({
  audioUrl,
  title,
  artwork,
  showControls = true,
  autoplay = false,
  settings,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Set up audio element event listeners
    const audioElement = audioRef.current
    if (!audioElement) return

    const setAudioData = () => {
      setDuration(audioElement.duration)
    }

    const setAudioTime = () => {
      setCurrentTime(audioElement.currentTime)
    }

    const handlePlayState = () => {
      setIsPlaying(!audioElement.paused)
    }

    // Add event listeners
    audioElement.addEventListener('loadedmetadata', setAudioData)
    audioElement.addEventListener('timeupdate', setAudioTime)
    audioElement.addEventListener('play', handlePlayState)
    audioElement.addEventListener('pause', handlePlayState)

    // Handle autoplay
    if (autoplay) {
      try {
        audioElement.play().catch(() => {
          // Autoplay was prevented by browser
          console.log('Autoplay was prevented by the browser')
        })
      } catch (error) {
        console.error('Autoplay error', error)
      }
    }

    // Cleanup event listeners
    return () => {
      audioElement.removeEventListener('loadedmetadata', setAudioData)
      audioElement.removeEventListener('timeupdate', setAudioTime)
      audioElement.removeEventListener('play', handlePlayState)
      audioElement.removeEventListener('pause', handlePlayState)
    }
  }, [audioRef, autoplay])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio', error)
        })
      }
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10 // Skip 10 seconds forward
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10 // Skip 10 seconds backward
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <GridContainer settings={settings}>
      <div className="w-full max-w-4xl mx-auto my-8 bg-card rounded-lg border p-4">
        <div className="flex items-center gap-4">
          {/* Artwork */}
          {artwork?.url && (
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={artwork.url}
                alt={title || 'Audio artwork'}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Audio player */}
          <div className="flex-1">
            {title && <h3 className="font-medium mb-2">{title}</h3>}

            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              controls={showControls && !isPlaying}
              className={cn('w-full', showControls && !isPlaying ? 'block' : 'hidden')}
            />

            {(!showControls || isPlaying) && (
              <div className="flex flex-col gap-2">
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-10">
                    {formatTime(currentTime)}
                  </span>

                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    step={0.1}
                    onChange={handleSeek}
                    className="flex-1 h-2 rounded-full bg-muted appearance-none cursor-pointer"
                  />

                  <span className="text-xs text-muted-foreground w-10">
                    {formatTime(duration - currentTime)}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={skipBackward}
                    aria-label="Skip backward 10 seconds"
                  >
                    <SkipBack size={20} />
                  </button>

                  <button
                    className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center hover:bg-primary/90 transition-colors"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>

                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={skipForward}
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward size={20} />
                  </button>

                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors ml-4"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GridContainer>
  )
}
