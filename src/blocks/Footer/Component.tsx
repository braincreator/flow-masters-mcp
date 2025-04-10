import React from 'react'
import Link from 'next/link'
import { GridContainer } from '@/components/GridContainer'
import { RichText } from '@/components/RichText'
import type { FooterBlock as FooterBlockType } from '@/types/blocks'
import { cn } from '@/lib/utils'
import { Twitter, Facebook, Instagram, Linkedin, Youtube, Github, ExternalLink } from 'lucide-react'

type FooterLayout = 'simple' | 'columns' | 'centered'
type FooterStyle = 'default' | 'minimal' | 'dark'

const layoutStyles: Record<FooterLayout, string> = {
  simple: 'space-y-8 text-center',
  columns: 'grid gap-8 sm:grid-cols-2 lg:grid-cols-4',
  centered: 'max-w-2xl mx-auto space-y-8 text-center',
}

const styleVariants: Record<FooterStyle, string> = {
  default: 'bg-muted/50',
  minimal: 'border-t',
  dark: 'bg-background text-foreground',
}

const socialIcons = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
}

interface FooterProps extends FooterBlockType {
  className?: string
  layout?: FooterLayout
  style?: FooterStyle
}

interface FooterColumnProps {
  title: string
  links: Array<{
    label: string
    href: string
    isExternal?: boolean
  }>
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, links }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
    <ul className="space-y-2">
      {links.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className={cn(
              'text-sm text-muted-foreground hover:text-foreground transition-colors',
              'flex items-center gap-1',
            )}
            target={link.isExternal ? '_blank' : undefined}
            rel={link.isExternal ? 'noopener noreferrer' : undefined}
          >
            {link.label}
            {link.isExternal && <ExternalLink className="h-3 w-3" />}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

export const Footer: React.FC<FooterProps> = ({
  logo,
  copyright,
  columns,
  social,
  settings,
  className,
  layout = 'columns',
  style = 'default',
}) => {
  return (
    <footer className={cn('w-full py-12', styleVariants[style], className)}>
      <GridContainer settings={settings}>
        <div className={cn(layoutStyles[layout])}>
          {/* Logo и копирайт для simple и centered layouts */}
          {(layout === 'simple' || layout === 'centered') && (
            <div className="space-y-4">
              {logo?.url && (
                <Link href="/" className="inline-block">
                  <img src={logo.url} alt={logo.alt || 'Logo'} className="h-8 w-auto" />
                </Link>
              )}
              {copyright && (
                <div className="text-sm text-muted-foreground">
                  <RichText content={copyright} />
                </div>
              )}
            </div>
          )}

          {/* Колонки для columns layout */}
          {layout === 'columns' &&
            columns?.map((column, index) => (
              <FooterColumn key={index} title={column.title} links={column.links} />
            ))}

          {/* Социальные сети */}
          {social && social.length > 0 && (
            <div
              className={cn(
                'flex gap-4',
                layout !== 'columns' ? 'justify-center' : 'justify-start',
              )}
            >
              {social.map((item, index) => {
                const Icon = socialIcons[item.platform as keyof typeof socialIcons]
                if (!Icon) return null

                return (
                  <Link
                    key={index}
                    href={item.url}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{item.platform}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Копирайт для columns layout */}
          {layout === 'columns' && copyright && (
            <div className="col-span-full text-sm text-muted-foreground text-center mt-8 pt-8 border-t">
              <RichText content={copyright} />
            </div>
          )}
        </div>
      </GridContainer>
    </footer>
  )
}

export const FooterBlock = Footer
export default Footer
