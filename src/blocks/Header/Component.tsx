"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { GridContainer } from '@/components/GridContainer'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X } from 'lucide-react'
import type { HeaderBlock as HeaderBlockType } from '@/types/blocks'
import { cn } from '@/lib/utils'

type HeaderStyle = 'default' | 'centered' | 'minimal'
type HeaderSticky = 'none' | 'always' | 'scrolled'

const styleVariants: Record<HeaderStyle, string> = {
  default: '',
  centered: 'text-center',
  minimal: 'border-b',
}

interface HeaderProps extends HeaderBlockType {
  className?: string
  style?: HeaderStyle
  sticky?: HeaderSticky
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  navigation,
  actions,
  settings,
  className,
  style = 'default',
  sticky = 'none',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (sticky === 'scrolled') {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20)
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [sticky])

  const shouldStick = sticky === 'always' || (sticky === 'scrolled' && isScrolled)

  return (
    <header
      className={cn(
        'w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        shouldStick &&
          'fixed top-0 left-0 right-0 z-50 border-b animate-in fade-in slide-in-from-top-4',
        styleVariants[style],
        className,
      )}
    >
      <GridContainer settings={settings}>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            {logo?.url ? (
              <Link href="/" className="flex items-center">
                <img src={logo.url} alt={logo.alt || 'Logo'} className="h-8 w-auto" />
              </Link>
            ) : (
              <Link href="/" className="text-xl font-bold">
                Logo
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation?.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  item.isActive && 'text-primary',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.style === 'secondary' ? 'outline' : 'default'}
                size="sm"
                href={action.href}
              >
                {action.label}
              </Button>
            ))}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <div className="flex flex-col space-y-6 pt-6">
                {navigation?.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary',
                      item.isActive && 'text-primary',
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {actions?.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.style === 'secondary' ? 'outline' : 'default'}
                    className="w-full"
                    href={action.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </GridContainer>
    </header>
  )
}

export const HeaderBlock = Header
export default Header
