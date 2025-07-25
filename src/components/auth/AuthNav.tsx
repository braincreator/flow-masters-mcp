'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, BookOpen, Settings, Briefcase, Folder, ShoppingCart } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AuthNav() {
  const t = useTranslations('common')
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  // We don't need to refresh auth on every mount
  // The AuthProvider already checks auth in its own useEffect
  // This was causing an infinite loop
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] || 'en'

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${currentLocale}/login`}>{t('login')}</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/${currentLocale}/register`}>{t('register')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="group relative h-8 w-8 rounded-full p-0 border-border/50 hover:bg-accent hover:text-accent-foreground hover:border-accent/50 transition-all duration-200 hover:shadow-md hover:scale-105"
          aria-label={t('userMenuLabel')}
        >
          <Avatar className="h-8 w-8 group-hover:bg-transparent">
            {user?.avatar ? (
              <AvatarImage
                src={user.avatar}
                alt={user.name || 'User Avatar'}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                {user?.name ? (
                  user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-background border border-border/50 shadow-lg rounded-lg p-1 backdrop-blur-sm"
        sideOffset={8}
      >
        <div className="flex items-center justify-start gap-3 p-3 border-b border-border/50">
          <div className="flex flex-col space-y-1 leading-none">
            {user?.name && (
              <p className="font-medium text-foreground text-sm">{user.name}</p>
            )}
            {user?.email && (
              <p className="w-[180px] truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`/${currentLocale}/account/profile`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>{t('account')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${currentLocale}/dashboard/projects`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Briefcase className="h-4 w-4" />
            <span>{t('myProjects')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${currentLocale}/courses`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>{t('myCourses')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${currentLocale}/account/orders`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{t('orders')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  )
}
