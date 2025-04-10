import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatImageSize = (width: number, height: number, maxWidth = 1920) => {
  const aspectRatio = width / height
  const newWidth = Math.min(width, maxWidth)
  const newHeight = Math.round(newWidth / aspectRatio)

  return {
    width: newWidth,
    height: newHeight,
    aspectRatio: `${width}/${height}`,
  }
}
