"use client"
'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/utilities/ui'
import { Play, Pause, SkipBack, SkipForward, Download } from 'lucide-react'
import type { AudioBlock as AudioBlockType } from '@/types/blocks'

type AudioBlockProps = AudioBlockType

export const Audio: React.FC<AudioBlockProps> = ({
  audioFile,
  title,
  artist,
  description,
  showWaveform = true,
  autoPlay = false,
  loop = false,
  downloadable = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="my-8 w-full max-w-3xl mx-auto bg-card rounded-lg p-4 shadow-sm">
      <div className="flex flex-col space-y-4">
        {/* Заголовок и исполнитель */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">{title}</h3>
          {artist && <p className="text-sm text-muted-foreground">{artist}</p>}
        </div>

        {/* Аудио плеер */}
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={audioFile.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            autoPlay={autoPlay}
            loop={loop}
            className="hidden"
          />

          {/* Прогресс бар */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-primary transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Контролы */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={skipBackward}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Skip backward 10 seconds"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>

              <button
                onClick={skipForward}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {downloadable && (
                <a
                  href={audioFile.url}
                  download={audioFile.filename}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Download audio"
                >
                  <Download className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Описание */}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

export const AudioBlock = Audio
export default Audio
