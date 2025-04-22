import { Media } from '@/payload-types'

export type MessageSender = 'user' | 'bot' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error'
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'card'
  | 'buttons'
  | 'quickReplies'

export interface MessageButton {
  id: string
  text: string
  value: string
  url?: string
  action?: 'link' | 'reply' | 'download' | 'copy'
  style?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  icon?: string
}

export interface MessageQuickReply {
  id: string
  text: string
  value: string
}

export interface MessageCard {
  title: string
  subtitle?: string
  imageUrl?: string
  buttons?: MessageButton[]
  footer?: string
}

export interface MessageMedia {
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  thumbnailUrl?: string
  altText?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  width?: number
  height?: number
  duration?: number
}

export interface Message {
  id: string
  content: string | any // Может быть строкой или RichText
  sender: MessageSender
  timestamp: Date
  senderName?: string
  avatar?: string | Media
  isError?: boolean
  status?: MessageStatus
  metadata?: Record<string, any>
  type?: MessageType
  media?: MessageMedia
  card?: MessageCard
  buttons?: MessageButton[]
  quickReplies?: MessageQuickReply[]
  retryCount?: number
  isTyping?: boolean
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  type?: MessageType
  metadata?: Record<string, any>
}

export interface ChatResponse {
  response: string | any
  status: 'success' | 'error'
  metadata?: Record<string, any>
  type?: MessageType
  media?: MessageMedia
  card?: MessageCard
  buttons?: MessageButton[]
  quickReplies?: MessageQuickReply[]
}
