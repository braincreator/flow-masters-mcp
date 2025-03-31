import React from 'react'
import Image from 'next/image'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/lib/utils'

interface TeamMember {
  name: string
  role: string
  avatar?: {
    url: string
    alt?: string
  }
  bio?: string
  socialLinks?: {
    platform: string
    url: string
  }[]
}

interface TeamMembersBlockProps {
  heading?: string
  subheading?: string
  members: TeamMember[]
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
  settings?: any
}

export const TeamMembersBlock: React.FC<TeamMembersBlockProps> = ({
  heading = 'Our Team',
  subheading,
  members = [],
  layout = 'grid',
  columns = 3,
  settings,
}) => {
  if (members.length === 0) return null

  return (
    <GridContainer settings={settings}>
      <div className="w-full">
        {heading && <h2 className="text-3xl font-bold mb-2 text-center">{heading}</h2>}

        {subheading && (
          <p className="text-lg text-muted-foreground mb-8 text-center">{subheading}</p>
        )}

        <div
          className={cn(
            layout === 'grid' && 'grid gap-8',
            layout === 'grid' && columns === 2 && 'grid-cols-1 md:grid-cols-2',
            layout === 'grid' && columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            layout === 'grid' && columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
            layout === 'list' && 'space-y-8',
          )}
        >
          {members.map((member, index) => (
            <div
              key={index}
              className={cn(
                'text-center p-4',
                layout === 'list' && 'flex items-center gap-6 text-left',
              )}
            >
              {member.avatar?.url && (
                <div
                  className={cn(
                    'relative rounded-full overflow-hidden bg-muted mx-auto mb-4',
                    layout === 'grid' && 'w-40 h-40',
                    layout === 'list' && 'w-20 h-20 mx-0 mb-0 flex-shrink-0',
                  )}
                >
                  <Image
                    src={member.avatar.url}
                    alt={member.avatar.alt || member.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                {member.role && <p className="text-muted-foreground mb-2">{member.role}</p>}

                {member.bio && layout === 'list' && <p className="text-sm mb-3">{member.bio}</p>}

                {member.socialLinks && member.socialLinks.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {member.socialLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GridContainer>
  )
}
