'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Cog, ShoppingCart, Clock, Mail } from 'lucide-react'
import { RichText } from '@/components/RichText'
import type { TermsPage as TermsPageType } from '@/payload-types'

interface TermsPageProps {
  termsPages: TermsPageType[]
}

// Icon mapping for tab types
const getTabIcon = (tabType: string) => {
  switch (tabType) {
    case 'services':
      return FileText
    case 'consulting':
      return Users
    case 'systems':
      return Cog
    case 'products':
      return ShoppingCart
    default:
      return FileText
  }
}

export function TermsPage({ termsPages }: TermsPageProps) {
  const t = useTranslations('Terms')

  // Sort and filter active terms pages
  const activeTabs = termsPages
    .filter(page => page.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  if (!activeTabs.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">
              {t('noContent', 'Контент не найден')}
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            {t('header.badge')}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            {t('header.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('header.description')}
          </p>
        </div>

        {/* Compact Tabs */}
        <Tabs defaultValue={activeTabs[0]?.tabType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 h-auto p-1 bg-card/80 backdrop-blur-sm border shadow-sm">
            {activeTabs.map((page) => {
              const Icon = getTabIcon(page.tabType)
              return (
                <TabsTrigger
                  key={page.id}
                  value={page.tabType}
                  className="flex flex-col items-center gap-1.5 p-2 md:p-3 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-xs md:text-sm truncate">{page.title}</span>
                  </div>
                  {page.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {page.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {activeTabs.map((page) => {
            const Icon = getTabIcon(page.tabType)
            return (
              <TabsContent key={page.id} value={page.tabType} className="mt-0">
                <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-6">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold">
                      {page.title}
                    </CardTitle>
                    {page.subtitle && (
                      <CardDescription className="text-base md:text-lg text-muted-foreground">
                        {page.subtitle}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Main Content */}
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                      <RichText content={page.content} enableGutter={false} />
                    </div>

                    {/* Important Note */}
                    {page.importantNote && (
                      <div className="bg-muted/50 rounded-lg p-4 md:p-6 border-l-4 border-primary">
                        <h3 className="font-semibold text-base md:text-lg mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          {t('common.importantNote')}
                        </h3>
                        <div className="text-sm md:text-base text-muted-foreground">
                          <RichText content={page.importantNote} enableGutter={false} />
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 md:p-6 border border-primary/20">
                      <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        {t('common.contactInfo')}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3 md:gap-4 text-sm">
                        <div>
                          <p className="font-medium mb-1">{t('common.email')}</p>
                          <p className="text-muted-foreground">admin@flow-masters.ru</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('common.lastUpdated')}
                          </p>
                          <p className="text-muted-foreground">
                            {page.publishedAt
                              ? new Date(page.publishedAt).toLocaleDateString('ru-RU')
                              : t('common.updateDate')
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border/50">
          <p className="text-xs md:text-sm text-muted-foreground">
            {t('footer.text')}
          </p>
        </div>
      </div>
    </div>
  )
}
