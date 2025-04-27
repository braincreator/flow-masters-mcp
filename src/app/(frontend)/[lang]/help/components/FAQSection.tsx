'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FAQSectionProps {
  locale: string
  searchQuery: string
}

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  items: FAQItem[]
}

export function FAQSection({ locale, searchQuery }: FAQSectionProps) {
  const t = useTranslations('Help.faq')
  const [filteredFAQs, setFilteredFAQs] = useState<Record<string, FAQCategory>>({})

  // Get FAQ data from translations
  const faqData: Record<string, FAQCategory> = {
    account: {
      title: t('questions.account.title'),
      items: t('questions.account.items') as unknown as FAQItem[],
    },
    courses: {
      title: t('questions.courses.title'),
      items: t('questions.courses.items') as unknown as FAQItem[],
    },
    technical: {
      title: t('questions.technical.title'),
      items: t('questions.technical.items') as unknown as FAQItem[],
    },
  }

  // Filter FAQs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFAQs(faqData)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered: Record<string, FAQCategory> = {}

    Object.entries(faqData).forEach(([key, category]) => {
      const filteredItems = category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
      )

      if (filteredItems.length > 0) {
        filtered[key] = {
          ...category,
          items: filteredItems,
        }
      }
    })

    setFilteredFAQs(filtered)
  }, [searchQuery, faqData])

  // Check if there are any results
  const hasResults = Object.keys(filteredFAQs).length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>Find answers to common questions</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasResults ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('noResults')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredFAQs).map(([key, category]) => (
              <div key={key} className="space-y-4">
                <h3 className="text-lg font-medium">{category.title}</h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, index) => (
                    <AccordionItem key={index} value={`${key}-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
