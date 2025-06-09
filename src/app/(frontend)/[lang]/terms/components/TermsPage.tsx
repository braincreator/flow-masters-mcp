'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Cog, ShoppingCart } from 'lucide-react'
import { cn } from '@/utilities/ui'

export function TermsPage() {
  const t = useTranslations('Terms')

  const tabs = [
    {
      id: 'services',
      label: t('tabs.services.label'),
      icon: FileText,
      content: t('tabs.services.content'),
      badge: t('tabs.services.badge'),
    },
    {
      id: 'consulting',
      label: t('tabs.consulting.label'),
      icon: Users,
      content: t('tabs.consulting.content'),
      badge: t('tabs.consulting.badge'),
    },
    {
      id: 'systems',
      label: t('tabs.systems.label'),
      icon: Cog,
      content: t('tabs.systems.content'),
      badge: t('tabs.systems.badge'),
    },
    {
      id: 'products',
      label: t('tabs.products.label'),
      icon: ShoppingCart,
      content: t('tabs.products.content'),
      badge: t('tabs.products.badge'),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            {t('header.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            {t('header.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('header.description')}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-card/50 backdrop-blur-sm border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-2 p-3 md:p-4 h-auto data-[state=active]:bg-background data-[state=active]:shadow-md"
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-medium text-xs md:text-sm">{tab.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {tab.badge}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <tab.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    {t(`tabs.${tab.id}.title`)}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    {t(`tabs.${tab.id}.subtitle`)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Terms Content */}
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div 
                      className="space-y-6 text-foreground/90 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: tab.content }}
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="bg-muted/50 rounded-xl p-6 border-l-4 border-primary">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {t('common.importantNote')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t(`tabs.${tab.id}.note`)}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                    <h3 className="font-semibold text-lg mb-3">
                      {t('common.contactInfo')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">{t('common.email')}</p>
                        <p className="text-muted-foreground">admin@flow-masters.ru</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">{t('common.lastUpdated')}</p>
                        <p className="text-muted-foreground">{t('common.updateDate')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            {t('footer.text')}
          </p>
        </div>
      </div>
    </div>
  )
}
