'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { User, Briefcase, BookOpen, ShoppingCart, Loader2 } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface NavLinkProps {
  href: string
  icon: React.ElementType
  label: string
  currentPath: string
  lang: string
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, currentPath, lang }) => {
  const fullHref = `/${lang}${href}`
  const isActive = currentPath === fullHref || (href === '/account' && currentPath === `/${lang}/account`) // Handle base account path

  return (
    <Link
      href={fullHref}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}

export function AccountSidebar() {
  const t = useTranslations('AccountSidebar') // Assuming 'AccountSidebar' namespace in translation files
  const tAccount = useTranslations('Account') // For general account terms if needed
  const { user, isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const lang = pathname.split('/')[1] || 'en'

  if (isLoading) {
    return (
      <div className="w-full space-y-2 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <div className="h-4 w-24 rounded bg-muted-foreground/20 animate-pulse"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    // Or redirect, or show a login prompt, depending on desired UX for unauthorized access to /account
    return null
  }

  const navLinks = [
    { href: '/account/profile', icon: User, label: t('profile') },
    { href: '/dashboard/projects', icon: Briefcase, label: t('myProjects') },
    { href: '/account/my-courses', icon: BookOpen, label: t('myCourses') },
    { href: '/account/orders', icon: ShoppingCart, label: t('orders') },
  ]

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                currentPath={pathname}
                lang={lang}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}