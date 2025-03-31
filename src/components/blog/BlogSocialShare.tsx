'use client'

import React from 'react'
import { useSocialShare } from '@/lib/blogHooks'
import { Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'

interface BlogSocialShareProps {
  url: string
  title: string
  description?: string
  postId?: string
}

export function BlogSocialShare({ url, title, description = '', postId }: BlogSocialShareProps) {
  // Add base URL for absolute URLs if not provided
  const fullUrl = url.startsWith('http')
    ? url
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}${url}`

  // Track sharing events if postId is provided
  const { trackShare } = postId ? useSocialShare(postId) : { trackShare: () => {} }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${fullUrl}`)}`,
  }

  const handleShare = (platform: string) => {
    window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'noopener,noreferrer')
    trackShare(platform)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(
      () => {
        toast({
          title: 'Link copied!',
          description: 'The link has been copied to your clipboard.',
          duration: 3000,
        })
        trackShare('copy')
      },
      () => {
        toast({
          title: 'Failed to copy',
          description: 'Could not copy the link to your clipboard.',
          variant: 'destructive',
          duration: 3000,
        })
      },
    )
  }

  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm font-medium">Share:</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Share on Twitter"
          onClick={() => handleShare('twitter')}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Twitter className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Share on Facebook"
          onClick={() => handleShare('facebook')}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Facebook className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Share on LinkedIn"
          onClick={() => handleShare('linkedin')}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Linkedin className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Share via Email"
          onClick={() => handleShare('email')}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Mail className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Copy link"
          onClick={copyToClipboard}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More sharing options"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleShare('twitter')}>
              <Twitter className="h-4 w-4 mr-2" />
              <span>Twitter</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('facebook')}>
              <Facebook className="h-4 w-4 mr-2" />
              <span>Facebook</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('linkedin')}>
              <Linkedin className="h-4 w-4 mr-2" />
              <span>LinkedIn</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('email')}>
              <Mail className="h-4 w-4 mr-2" />
              <span>Email</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={copyToClipboard}>
              <LinkIcon className="h-4 w-4 mr-2" />
              <span>Copy link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
