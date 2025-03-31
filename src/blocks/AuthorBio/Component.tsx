import React from 'react'
import Image from 'next/image'
import { GridContainer } from '@/components/GridContainer'
import { AuthorBioBlock } from '@/types/blocks'
import { cn } from '@/lib/utils'
import { Facebook, Twitter, Linkedin, Globe, Instagram, Github } from 'lucide-react'

export const AuthorBioBlock: React.FC<AuthorBioBlock> = ({ author, layout = 'card', settings }) => {
  // Map of social platform to icon
  const socialIcons: Record<string, React.ReactNode> = {
    twitter: <Twitter size={18} />,
    facebook: <Facebook size={18} />,
    linkedin: <Linkedin size={18} />,
    website: <Globe size={18} />,
    instagram: <Instagram size={18} />,
    github: <Github size={18} />,
  }

  return (
    <GridContainer settings={settings}>
      <div
        className={cn(
          'w-full max-w-4xl mx-auto my-8',
          layout === 'inline' ? 'flex items-center gap-6' : 'block',
          layout === 'card' && 'p-6 border rounded-lg bg-card',
        )}
      >
        {/* Author Avatar */}
        {author.avatar?.url && (
          <div
            className={cn(
              'relative overflow-hidden rounded-full bg-muted',
              layout === 'inline' ? 'w-16 h-16 flex-shrink-0' : 'w-24 h-24 mx-auto mb-4',
            )}
          >
            <Image src={author.avatar.url} alt={author.name} fill className="object-cover" />
          </div>
        )}

        {/* Author Info */}
        <div className={cn(layout === 'card' && 'text-center')}>
          <h3 className="text-xl font-medium mb-1">{author.name}</h3>

          {author.role && (
            <p className="text-sm text-muted-foreground mb-3">
              {author.role}
              {author.company && ` at ${author.company}`}
            </p>
          )}

          {author.bio && <p className="text-sm mb-4">{author.bio}</p>}

          {/* Social Links */}
          {author.socialLinks && author.socialLinks.length > 0 && (
            <div
              className={cn('flex gap-3', layout === 'card' ? 'justify-center' : 'justify-start')}
            >
              {author.socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Visit ${author.name}'s ${link.platform} profile`}
                >
                  {link.icon ? (
                    <span className="block w-5 h-5">{link.icon}</span>
                  ) : (
                    socialIcons[link.platform.toLowerCase()] || <Globe size={18} />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </GridContainer>
  )
}
