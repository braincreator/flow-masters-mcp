'use client'
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { BaseBlock } from '@/blocks/BaseBlock/Component'
import { Button } from '@/components/ui/button'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  SkipBack,
  SkipForward,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import type {
  Video as VideoBlockType,
  VideoType,
  AspectRatio,
  VideoStyle,
  VideoSize,
} from '@/types/blocks'
import { cn } from '@/lib/utils'

const aspectRatios = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '9/16': 'aspect-[9/16]',
}

interface VideoProps extends VideoBlockType, BlockStyleProps {}

interface CustomVideoPlayerProps {
  videoUrl: string
  poster?: { url: string; alt?: string }
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  aspectRatio?: keyof typeof aspectRatios
}

interface EmbeddedPlayerProps {
  videoType: string
  videoId: string
  aspectRatio: keyof typeof aspectRatios
}

const getVideoUrl = (videoType: VideoType, videoId?: string, videoUrl?: string): string => {
  if (!videoId && !videoUrl) return ''

  switch (videoType) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`
    case 'rutube':
      return `https://rutube.ru/play/embed/${videoId}`
    case 'vk':
      return `https://vk.com/video_ext.php?oid=${videoId}`
    case 'url':
      return videoUrl || ''
    default:
      return ''
  }
}

const formatTime = (seconds: number) => {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  videoUrl,
  poster,
  autoPlay = false,
  muted: initialMuted = false,
  controls: showControls = true,
  aspectRatio = '16/9',
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(initialMuted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Создаем объект AbortController для управления событиями
    const abortController = new AbortController()
    const signal = abortController.signal

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDurationChange = () => setDuration(video.duration)
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }
    const handleLoadedData = () => {
      setIsLoading(false)
      if (autoPlay) {
        video.play().catch(() => setIsPlaying(false))
      }
    }
    const handleError = () => {
      setError('Ошибка загрузки видео')
      setIsLoading(false)
    }
    const handleWaiting = () => setIsBuffering(true)
    const handlePlaying = () => setIsBuffering(false)
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const duration = video.duration
        if (bufferedEnd >= duration) {
          setIsBuffering(false)
        }
      }
    }

    // Используем опцию signal для автоматического удаления обработчиков
    video.addEventListener('timeupdate', handleTimeUpdate, { signal })
    video.addEventListener('durationchange', handleDurationChange, { signal })
    video.addEventListener('loadstart', handleLoadStart, { signal })
    video.addEventListener('loadeddata', handleLoadedData, { signal })
    video.addEventListener('error', handleError, { signal })
    video.addEventListener('waiting', handleWaiting, { signal })
    video.addEventListener('playing', handlePlaying, { signal })
    video.addEventListener('progress', handleProgress, { signal })
    document.addEventListener('fullscreenchange', handleFullscreenChange, { signal })

    // Предварительная загрузка
    video.preload = 'auto'

    return () => {
      // Отменяем все события сразу
      abortController.abort()

      // Останавливаем воспроизведение и освобождаем ресурсы
      if (!video.paused) {
        try {
          video.pause()
        } catch (e) {
          console.error('Error pausing video:', e)
        }
      }

      // Очищаем ссылки на источник
      video.removeAttribute('src')
      video.load()
    }
  }, [autoPlay])

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !videoRef.current) return

      const rect = progressRef.current.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = pos * duration
    },
    [duration],
  )

  const handleVolumeChange = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value
      setVolume(value)
      setIsMuted(value === 0)
    }
  }, [])

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }, [])

  const skipTime = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative group overflow-hidden rounded-lg bg-black',
        aspectRatios[aspectRatio || '16/9'],
      )}
      tabIndex={0}
      role="region"
      aria-label="Video player"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster?.url}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
        loop
      />

      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
          <span className="text-white mb-2">{error}</span>
          <Button
            variant="outline"
            onClick={() => {
              setError(null)
              if (videoRef.current) {
                videoRef.current.load()
              }
            }}
          >
            Попробовать снова
          </Button>
        </div>
      )}

      {showControls && !error && (
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative w-full p-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div
              ref={progressRef}
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => skipTime(-10)}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => skipTime(10)}
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              <div
                className="relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                {showVolumeSlider && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-24 p-2 bg-black/80 rounded">
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.1}
                      onValueChange={(values: number[]) => handleVolumeChange(values[0] || 0)}
                      aria-label="Volume"
                    />
                  </div>
                )}
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handlePlaybackSpeedChange(0.5)}>
                    0.5x {playbackSpeed === 0.5 && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePlaybackSpeedChange(1)}>
                    1x {playbackSpeed === 1 && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePlaybackSpeedChange(1.5)}>
                    1.5x {playbackSpeed === 1.5 && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePlaybackSpeedChange(2)}>
                    2x {playbackSpeed === 2 && '✓'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const EmbeddedPlayer: React.FC<EmbeddedPlayerProps> = ({ videoType, videoId, aspectRatio }) => {
  const videoUrl = getVideoUrl(videoType as VideoType, videoId)

  return (
    <div className={cn('relative rounded-lg overflow-hidden', aspectRatios[aspectRatio || '16/9'])}>
      <iframe
        src={videoUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

type VideoComponentProps = Video & {
  className?: string
}

const getAspectRatioClass = (aspectRatio?: AspectRatio): string => {
  switch (aspectRatio) {
    case '16/9':
      return 'aspect-video'
    case '4/3':
      return 'aspect-[4/3]'
    case '1/1':
      return 'aspect-square'
    case '9/16':
      return 'aspect-[9/16]'
    default:
      return 'aspect-video'
  }
}

const getSizeClass = (size?: VideoSize): string => {
  switch (size) {
    case 'full':
      return 'w-full'
    case 'medium':
      return 'max-w-3xl mx-auto'
    case 'small':
      return 'max-w-xl mx-auto'
    default:
      return 'w-full'
  }
}

const getStyleClass = (style?: VideoStyle): string => {
  switch (style) {
    case 'elevated':
      return 'shadow-lg rounded-lg overflow-hidden'
    case 'bordered':
      return 'border-2 border-gray-200 rounded-lg overflow-hidden'
    default:
      return ''
  }
}

export const VideoComponent: React.FC<VideoComponentProps> = ({
  videoType,
  videoId,
  videoUrl,
  videoFile,
  poster,
  aspectRatio,
  autoPlay,
  muted,
  loop,
  controls = true,
  caption,
  style,
  size,
  className,
  ...rest
}) => {
  const videoSrc = getVideoUrl(videoType, videoId, videoUrl)

  return (
    <BaseBlock {...rest}>
      <div className={cn(getSizeClass(size), getStyleClass(style), className)}>
        <div className={getAspectRatioClass(aspectRatio)}>
          {videoType === 'file' && videoFile ? (
            <video
              src={videoFile.url}
              poster={poster?.url}
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
              controls={controls}
              className="w-full h-full object-cover"
            />
          ) : (
            <iframe
              src={videoSrc}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
        {caption && <p className="mt-2 text-sm text-gray-500">{caption}</p>}
      </div>
    </BaseBlock>
  )
}

export default VideoComponent
