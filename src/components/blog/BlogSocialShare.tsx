'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Facebook, Twitter, Linkedin, Copy, Check, Mail } from 'lucide-react'

interface BlogSocialShareProps {
  url: string
  title: string
  description: string
  postId?: string
}

export function BlogSocialShare({ url, title, description, postId }: BlogSocialShareProps) {
  const [copied, setCopied] = useState(false)

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  // Track share event
  const trackShare = async (platform: string) => {
    if (!postId) return

    try {
      await fetch(`/api/blog/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          platform,
        }),
      })
    } catch (error) {
      console.error('Failed to track share:', error)
    }
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    trackShare('copy')

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // Share platforms
  const sharePlatforms = [
    {
      name: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      onClick: () => trackShare('facebook'),
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-4 w-4" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
      onClick: () => trackShare('twitter'),
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
      onClick: () => trackShare('linkedin'),
    },
    {
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${fullUrl}`)}`,
      onClick: () => trackShare('email'),
    },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Share:</span>

      <TooltipProvider>
        {sharePlatforms.map((platform) => (
          <Tooltip key={platform.name}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  window.open(platform.url, '_blank', 'noopener,noreferrer')
                  platform.onClick()
                }}
              >
                {platform.icon}
                <span className="sr-only">Share on {platform.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share on {platform.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy link</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? 'Copied!' : 'Copy link'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
