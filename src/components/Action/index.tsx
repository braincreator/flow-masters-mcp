import React from 'react'
import { Button } from '@/components/ui/button'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import { ArrowRight, ExternalLink, Download } from 'lucide-react'

const icons = {
  'arrow-right': ArrowRight,
  'external-link': ExternalLink,
  'download': Download,
  'none': null,
}

export type ActionProps = {
  actionType: 'button' | 'link'
  label: string
  type?: 'reference' | 'custom'
  reference?: {
    value: string | { slug: string }
    relationTo: string
  }
  url?: string
  appearance?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost'
  newTab?: boolean
  icon?: keyof typeof icons
  className?: string
  onClick?: () => void
}

export const Action: React.FC<ActionProps> = ({
  actionType,
  label,
  type,
  reference,
  url,
  appearance = 'default',
  newTab,
  icon = 'none',
  className,
  onClick,
}) => {
  const Icon = icons[icon]
  const content = (
    <>
      {label}
      {Icon && <Icon className="ml-2 h-4 w-4" />}
    </>
  )

  if (actionType === 'button') {
    return (
      <Button
        variant={appearance}
        className={className}
        onClick={onClick}
        {...(url && {
          as: 'a',
          href: url,
          target: newTab ? '_blank' : undefined,
          rel: newTab ? 'noopener noreferrer' : undefined,
        })}
      >
        {content}
      </Button>
    )
  }

  return (
    <CMSLink
      type={type}
      reference={reference}
      url={url}
      variant={appearance}
      className={cn('inline-flex items-center', className)}
      newTab={newTab}
      onClick={onClick}
    >
      {content}
    </CMSLink>
  )
}