import { cn } from '@/lib/utils'
import { Image } from './Image'

interface ImageGridProps {
  images: Array<{
    src: string
    alt: string
    width: number
    height: number
  }>
  className?: string
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  aspectRatio?: 'square' | 'video' | 'auto'
}

const gapStyles = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

const columnStyles = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

const aspectRatioStyles = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: 'aspect-auto',
}

export const ImageGrid = ({
  images,
  className,
  columns = 3,
  gap = 'md',
  aspectRatio = 'square',
}: ImageGridProps) => {
  if (!images?.length) return null

  return (
    <div className={cn('grid', columnStyles[columns], gapStyles[gap], className)}>
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={cn('relative overflow-hidden', aspectRatioStyles[aspectRatio])}
        >
          <Image {...image} className="object-cover" animate />
        </div>
      ))}
    </div>
  )
}
