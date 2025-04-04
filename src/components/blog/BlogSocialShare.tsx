'use client'

import React, { useState } from 'react'
import { Share, Facebook, Twitter, Linkedin, Copy, Check, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlogSocialShareProps {
  url: string
  title: string
  description?: string
  postId: string
}

export function BlogSocialShare({ url, title, description = '', postId }: BlogSocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Формируем полный URL
  const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`

  // Функция для кодирования URL и текста для шаринга
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || '')

  // Ссылки для шаринга
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  }

  // Функция для копирования ссылки
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Отслеживание аналитики шаринга
  const trackShare = (platform: string) => {
    // В реальном проекте здесь будет код аналитики
    console.log(`Shared on ${platform}. Post ID: ${postId}`)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Share this post"
      >
        <Share className="h-4 w-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <div className="blog-fade-in visible absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-2 shadow-md z-10">
          <div className="grid grid-cols-4 gap-2">
            {/* Facebook */}
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackShare('facebook')}
              className="blog-tag flex flex-col items-center justify-center rounded-md p-2 transition-colors hover:bg-accent/10"
              aria-label="Share on Facebook"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="mt-1 text-[10px]">Facebook</span>
            </a>

            {/* Twitter */}
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackShare('twitter')}
              className="blog-tag flex flex-col items-center justify-center rounded-md p-2 transition-colors hover:bg-accent/10"
              aria-label="Share on Twitter"
            >
              <Twitter className="h-5 w-5 text-sky-500" />
              <span className="mt-1 text-[10px]">Twitter</span>
            </a>

            {/* LinkedIn */}
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackShare('linkedin')}
              className="blog-tag flex flex-col items-center justify-center rounded-md p-2 transition-colors hover:bg-accent/10"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span className="mt-1 text-[10px]">LinkedIn</span>
            </a>

            {/* Email */}
            <a
              href={shareLinks.email}
              onClick={() => trackShare('email')}
              className="blog-tag flex flex-col items-center justify-center rounded-md p-2 transition-colors hover:bg-accent/10"
              aria-label="Share via email"
            >
              <Mail className="h-5 w-5 text-emerald-600" />
              <span className="mt-1 text-[10px]">Email</span>
            </a>
          </div>

          {/* Copy link */}
          <button
            onClick={copyToClipboard}
            className="blog-tag mt-2 flex w-full items-center justify-center rounded-md p-2 text-sm transition-colors hover:bg-accent/10"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
