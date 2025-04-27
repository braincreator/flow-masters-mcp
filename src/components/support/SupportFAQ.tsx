'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'

interface SupportFAQProps {
  locale: string
}

export function SupportFAQ({ locale }: SupportFAQProps) {
  const t = useTranslations('Support.FAQ')
  const [searchQuery, setSearchQuery] = useState('')

  // FAQ items
  const faqItems = [
    {
      id: 'account',
      question: t('items.account.question'),
      answer: t('items.account.answer'),
      category: 'account',
    },
    {
      id: 'password',
      question: t('items.password.question'),
      answer: t('items.password.answer'),
      category: 'account',
    },
    {
      id: 'courses',
      question: t('items.courses.question'),
      answer: t('items.courses.answer'),
      category: 'courses',
    },
    {
      id: 'certificates',
      question: t('items.certificates.question'),
      answer: t('items.certificates.answer'),
      category: 'certificates',
    },
    {
      id: 'payment',
      question: t('items.payment.question'),
      answer: t('items.payment.answer'),
      category: 'billing',
    },
    {
      id: 'refund',
      question: t('items.refund.question'),
      answer: t('items.refund.answer'),
      category: 'billing',
    },
    {
      id: 'technical',
      question: t('items.technical.question'),
      answer: t('items.technical.answer'),
      category: 'technical',
    },
    {
      id: 'mobile',
      question: t('items.mobile.question'),
      answer: t('items.mobile.answer'),
      category: 'technical',
    },
  ]

  // Filter FAQ items based on search query
  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredFAQs.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">{t('noResults')}</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4">{faq.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
