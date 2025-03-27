'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ShoppingCart, SearchIcon } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  // Ensure navItems is an array with proper type checking
  const navItems = Array.isArray(data?.navItems) ? data.navItems : []
  const { itemCount } = useCart()
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] || 'en'

  return (
    <nav className="flex items-center gap-6">
      {navItems.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          size="default"
          className="relative text-foreground/70 hover:text-accent transition-all duration-300
            after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px 
            after:bg-gradient-to-r after:from-accent/0 after:via-accent after:to-accent/0
            after:opacity-0 after:transform after:scale-x-0
            hover:after:opacity-100 hover:after:scale-x-100
            after:transition-all after:duration-300
            hover:translate-y-[-1px]"
        />
      ))}

      <Link
        href={`/${currentLocale}/checkout`}
        className="relative text-foreground/70 hover:text-accent transition-all duration-300"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span
            className={cn(
              'absolute -top-2 -right-2 bg-amber-500 text-black font-bold',
              'rounded-full min-w-5 h-5 flex items-center justify-center text-xs',
              'px-1 shadow-sm border border-background',
            )}
          >
            {itemCount}
          </span>
        )}
      </Link>
    </nav>
  )
}
