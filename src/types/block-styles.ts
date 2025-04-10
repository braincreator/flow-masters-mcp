import { BaseBlockSize } from '@/components/BaseBlock'

export type BlockStyle = 'default' | 'bordered' | 'minimal' | 'elevated' | 'gradient'
export type BlockHover = 'none' | 'lift' | 'glow' | 'scale'

export interface BlockStyleProps {
  className?: string
  style?: BlockStyle
  size?: BaseBlockSize
  hover?: BlockHover
}

export interface BlockSizeConfig {
  container: string
  title: string
  content: string
}

export interface BlockStyleConfig {
  background: string
  text: string
  border?: string
  shadow?: string
}
