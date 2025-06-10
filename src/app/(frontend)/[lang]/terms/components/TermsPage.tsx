'use client'

import React from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Users, Cog, ShoppingCart, Clock, Mail, AlertCircle } from 'lucide-react'
import { RichText } from '@/components/RichText'
import { cn } from '@/utilities/ui'

// Helper function to get localized value
const getLocalizedValue = (
  value: string | { ru?: string; en?: string } | undefined,
  locale: string,
): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[locale as 'ru' | 'en'] || value.ru || value.en || ''
}
// We'll use a generic type since the collection might not be generated yet
interface TermsPageType {
  id: string
  title: string | { ru?: string; en?: string }
  tabType: 'services' | 'consulting' | 'systems' | 'products'
  subtitle?: string | { ru?: string; en?: string }
  badge?: string | { ru?: string; en?: string }
  content: any // RichText content
  importantNote?: any // RichText content
  order?: number
  isActive: boolean
  publishedAt?: string
}

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
  const locale = useLocale()

  // Sort and filter active terms pages
  const activeTabs = termsPages
    .filter((page) => page.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  // Debug logging
  console.log('TermsPage received:', {
    totalPages: termsPages.length,
    activePages: activeTabs.length,
    pages: activeTabs.map((p) => ({
      id: p.id,
      title: p.title,
      tabType: p.tabType,
      hasContent: !!p.content,
    })),
  })

  if (!activeTabs.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">
              {t('noContent', 'Контент не найден')}
            </h1>
            <p className="mt-4 text-muted-foreground">
              Debug: Received {termsPages.length} total pages, {activeTabs.length} active tabs
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
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

        {/* Enhanced Tabs */}
        <Tabs defaultValue={activeTabs[0]?.tabType} className="w-full">
          <TabsList
            className={cn(
              'grid w-full mb-8 h-auto p-1.5 bg-card/90 backdrop-blur-sm border shadow-lg rounded-xl',
              activeTabs.length === 1 && 'grid-cols-1',
              activeTabs.length === 2 && 'grid-cols-1 sm:grid-cols-2',
              activeTabs.length === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              activeTabs.length >= 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
            )}
          >
            {activeTabs.map((page) => {
              const Icon = getTabIcon(page.tabType)
              return (
                <TabsTrigger
                  key={page.id}
                  value={page.tabType}
                  className="flex items-center gap-2 px-3 py-2 h-auto text-sm font-medium rounded-md"
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{getLocalizedValue(page.title, locale)}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {activeTabs.map((page) => {
            const Icon = getTabIcon(page.tabType)
            return (
              <TabsContent key={page.id} value={page.tabType} className="mt-0">
                <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="text-center pb-8 bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="mx-auto w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {getLocalizedValue(page.title, locale)}
                    </CardTitle>
                    {getLocalizedValue(page.subtitle, locale) && (
                      <CardDescription className="text-lg md:text-xl text-muted-foreground mt-2">
                        {getLocalizedValue(page.subtitle, locale)}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-8 p-6 md:p-8">
                    {/* Main Content */}
                    <div className="prose prose-base dark:prose-invert max-w-none w-full">
                      {(() => {
                        // Get localized content
                        const localizedContent = page.content?.[locale] || page.content

                        if (localizedContent) {
                          return <RichText data={localizedContent} />
                        } else {
                          return (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {t('noContent', 'Контент не найден')}
                              </AlertDescription>
                            </Alert>
                          )
                        }
                      })()}
                    </div>

                    {/* Important Note */}
                    {(() => {
                      const localizedImportantNote =
                        page.importantNote?.[locale] || page.importantNote
                      return localizedImportantNote ? (
                        <Alert className="border-primary/20 bg-primary/5 w-full">
                          <AlertCircle className="h-5 w-5 text-primary" />
                          <AlertDescription className="text-base w-full">
                            <div className="font-semibold text-primary mb-2">
                              {t('common.importantNote', 'Важная информация')}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none w-full">
                              <RichText data={localizedImportantNote} />
                            </div>
                          </AlertDescription>
                        </Alert>
                      ) : null
                    })()}

                    {/* Contact Info */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 md:p-6 border border-primary/20">
                      <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        {t('common.contactInfo')}
                      </h3>
                      <div className="space-y-4 text-sm">
                        {/* Legal Information */}
                        <div className="grid md:grid-cols-1 gap-3">
                          <div>
                            <p className="font-medium mb-1">{t('common.legalName')}</p>
                            <p className="text-muted-foreground">{t('common.legalNameValue')}</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <p className="font-medium mb-1">{t('common.inn')}</p>
                              <p className="text-muted-foreground">{t('common.innValue')}</p>
                            </div>
                            <div>
                              <p className="font-medium mb-1">{t('common.ogrnip')}</p>
                              <p className="text-muted-foreground">{t('common.ogrnipValue')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="grid md:grid-cols-2 gap-3 pt-3 border-t border-primary/10">
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
                                : t('common.updateDate')}
                            </p>
                          </div>
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
          <p className="text-xs md:text-sm text-muted-foreground">{t('footer.text')}</p>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
