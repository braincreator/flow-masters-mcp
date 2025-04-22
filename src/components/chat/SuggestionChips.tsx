'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type SuggestionChipsProps = {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
  primaryColor?: string
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSuggestionClick,
  primaryColor = '#0070f3',
}) => {
  if (!suggestions.length) return null

  return (
    <div className="flex flex-wrap gap-2.5">
      {suggestions.map((suggestion, index) => (
        <Button
          key={`${suggestion}-${index}`}
          variant="outline"
          size="sm"
          className="rounded-full text-xs py-1.5 px-4 quick-reply hover:shadow-sm"
          onClick={() => onSuggestionClick(suggestion)}
          style={{
            borderColor: primaryColor,
            color: primaryColor,
          }}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}

export default SuggestionChips
