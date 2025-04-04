import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as PayloadMedia } from '@/payload-types'

// Типы ресурсов
export type MediaResourceString = string
export type MediaResourceObject = {
  url: string
  filename?: string
  alt?: string
  id?: string
  [key: string]: any
}
export type MediaResource = MediaResourceString | MediaResourceObject | PayloadMedia | null

// Общие свойства для всех медиа-компонентов
export interface Props {
  alt?: string
  className?: string
  Component?: ElementType
  fill?: boolean
  imgClassName?: string
  onClick?: () => void
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: MediaResource
  size?: string // for NextImage only
  sizes?: string
  src?: StaticImageData | string // for static media
  videoClassName?: string
  width?: number | string
  height?: number | string
  quality?: number
  placeholder?: string
}

// Типы медиа
export enum MediaType {
  Image = 'image',
  Video = 'video',
  PDF = 'pdf',
  Unknown = 'unknown',
}
