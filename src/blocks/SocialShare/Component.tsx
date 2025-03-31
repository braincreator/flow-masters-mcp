'use client'

import React, { useState } from 'react'
import { GridContainer } from '@/components/GridContainer'
import { SocialShareBlock } from '@/types/blocks'
import { cn } from '@/lib/utils'
import { Twitter, Facebook, Linkedin, Mail, Copy, Check, Share2 } from 'lucide-react'

type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'email' | 'copy'

export const SocialShareBlock: React.FC<SocialShareBlock> = ({
  title = 'Share this article',
  platforms = ['twitter', 'facebook', 'linkedin', 'email', 'copy'],
  layout = 'horizontal',
  showShareCount = false,
  settings,
}) => {
  const [copied, setCopied] = useState(false)
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({
    twitter: 12,
    facebook: 34,
    linkedin: 7,
    reddit: 3,
    email: 0,
    copy: 42,
  })

  // Get current page URL
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const pageTitle = typeof document !== 'undefined' ? document.title : ''

  const handleShare = (platform: SharePlatform) => {
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`
        break
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(pageTitle)}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(pageUrl)}`
        break
      case 'copy':
        navigator.clipboard.writeText(pageUrl).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        break
    }

    if (shareUrl && platform !== 'copy') {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }

    // Update share count (in a real implementation, this would be an API call)
    if (showShareCount) {
      setShareCounts((prev) => ({
        ...prev,
        [platform]: prev[platform] + 1,
      }))
    }
  }

  // Map of platform to icon
  const platformIcons: Record<SharePlatform, React.ReactNode> = {
    twitter: <Twitter size={20} />,
    facebook: <Facebook size={20} />,
    linkedin: <Linkedin size={20} />,
    reddit: <Share2 size={20} />,
    email: <Mail size={20} />,
    copy: copied ? <Check size={20} /> : <Copy size={20} />,
  }

  // Map of platform to label
  const platformLabels: Record<SharePlatform, string> = {
    twitter: 'Twitter',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    reddit: 'Reddit',
    email: 'Email',
    copy: copied ? 'Copied!' : 'Copy link',
  }

  return (
    <GridContainer settings={settings}>
      <div className="w-full max-w-4xl mx-auto my-8">
        {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}

        <div
          className={cn(
            'flex gap-3',
            layout === 'vertical' && 'flex-col items-start',
            layout === 'horizontal' && 'flex-wrap',
          )}
        >
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md transition-colors',
                'bg-muted hover:bg-muted/80',
                copied && platform === 'copy' && 'bg-green-500/10 text-green-500',
              )}
              aria-label={`Share on ${platformLabels[platform]}`}
            >
              {platformIcons[platform]}
              <span>{platformLabels[platform]}</span>
              {showShareCount && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({shareCounts[platform]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </GridContainer>
  )
}
