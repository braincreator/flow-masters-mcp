'use client'

import React, { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

type ChatInputProps = {
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
  primaryColor?: string
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = 'Введите сообщение...',
  primaryColor = '#0070f3',
}) => {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-offset-1"
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        size="icon"
        className="rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default ChatInput
