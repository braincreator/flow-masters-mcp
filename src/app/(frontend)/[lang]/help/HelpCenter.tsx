'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsIndicatorStyles } from '@/components/ui/tabs'
import { Search, Mail, MessageSquare } from 'lucide-react'
import { FAQSection } from './components/FAQSection'
import { ResourcesSection } from './components/ResourcesSection'
import { ContactSupport } from './components/ContactSupport'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface HelpCenterProps {
  locale: string
}

export function HelpCenter({ locale }: HelpCenterProps) {
  const t = useTranslations('Help')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('faq')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would trigger a search through the help content
    logDebug('Searching for:', searchQuery)
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-6"
        />
      </form>

      {/* Help Categories */}
      <TabsIndicatorStyles />
      <Tabs defaultValue="faq" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="faq">{t('categories.faq')}</TabsTrigger>
          <TabsTrigger value="gettingStarted">{t('categories.gettingStarted')}</TabsTrigger>
          <TabsTrigger value="account">{t('categories.account')}</TabsTrigger>
          <TabsTrigger value="courses">{t('categories.courses')}</TabsTrigger>
          <TabsTrigger value="technical">{t('categories.technical')}</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <FAQSection locale={locale} searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="gettingStarted" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('categories.gettingStarted')}</CardTitle>
              <CardDescription>Learn how to get started with our platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Getting started content would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('categories.account')}</CardTitle>
              <CardDescription>Manage your account and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account and billing help content would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('categories.courses')}</CardTitle>
              <CardDescription>Learn about our courses and learning resources</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Courses and learning help content would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('categories.technical')}</CardTitle>
              <CardDescription>Get help with technical issues</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Technical support content would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resources Section */}
      <ResourcesSection locale={locale} />

      {/* Contact Support */}
      <ContactSupport locale={locale} />
    </div>
  )
}
