'use client'

import React, { Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Sparkles, TrendingUp, BookOpen, Users, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EnhancedBlogSkeleton } from './EnhancedBlogSkeleton'

interface ModernBlogLayoutProps {
  children: React.ReactNode
  totalPosts: number
  totalCategories: number
  totalTags: number
  className?: string
}

export function ModernBlogLayout({
  children,
  totalPosts,
  totalCategories,
  totalTags,
  className,
}: ModernBlogLayoutProps) {
  const t = useTranslations('blogPage')

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-grid-pattern animate-pulse" />
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-bounce" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-bounce delay-1000" />

        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm border border-primary/20">
              <Sparkles className="h-4 w-4" />
              {t('title')}
            </div>

            {/* Main heading */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl xl:text-7xl">
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {t('heroTitle')}
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto max-w-2xl text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t('description')} {t('heroSubtitle')}
            </p>

            {/* Stats Cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <StatsCard
                icon={<BookOpen className="h-6 w-6" />}
                value={totalPosts}
                label={t('statsArticles')}
                gradient="from-blue-500/20 to-cyan-500/20"
              />
              <StatsCard
                icon={<TrendingUp className="h-6 w-6" />}
                value={totalCategories}
                label={t('statsCategories')}
                gradient="from-purple-500/20 to-pink-500/20"
              />
              <StatsCard
                icon={<Users className="h-6 w-6" />}
                value={totalTags}
                label={t('statsTags')}
                gradient="from-green-500/20 to-emerald-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-12">
        <Suspense
          fallback={
            <div className="animate-in fade-in duration-500">
              <EnhancedBlogSkeleton count={6} showFeatured={true} showProgress={false} />
            </div>
          }
        >
          {children}
        </Suspense>
      </div>
    </div>
  )
}

interface StatsCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  gradient: string
}

function StatsCard({ icon, value, label, gradient }: StatsCardProps) {
  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', gradient)} />
      <CardContent className="relative p-6 text-center">
        <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-background/80 text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
      </CardContent>
    </Card>
  )
}

// Enhanced section wrapper for better content organization
export function BlogSection({
  title,
  subtitle,
  icon,
  children,
  className,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-8', className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="rounded-lg bg-primary/10 p-2">{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

// Enhanced sidebar wrapper
export function BlogSidebar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <aside className={cn('space-y-8', className)}>{children}</aside>
}

// Enhanced sidebar card
export function SidebarCard({
  title,
  icon,
  children,
  gradient = 'from-card to-card/50',
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  gradient?: string
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-border/50 shadow-lg backdrop-blur-sm',
        'bg-gradient-to-br',
        gradient,
      )}
    >
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-3">
          {icon && <div className="rounded-lg bg-primary/10 p-2">{icon}</div>}
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

// Loading wrapper with better UX
export function BlogLoadingWrapper({
  isLoading,
  children,
}: {
  isLoading: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isLoading && 'opacity-50 pointer-events-none',
      )}
    >
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}
