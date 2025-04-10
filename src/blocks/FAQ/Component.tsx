"use client"
'use client'

import React, { useState, useMemo } from 'react'
import type { FaqBlock as FaqBlockType } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export const FAQ: React.FC<FaqBlockType> = ({
  heading,
  subheading,
  items,
  layout = 'accordion',
  settings,
}) => {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach((item) => {
      if (item.category) cats.add(item.category)
    })
    return ['all', ...Array.from(cats)]
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = searchQuery
        ? item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof item.answer === 'string' &&
            item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
        : true

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [items, searchQuery, selectedCategory])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const renderAnswer = (answer: string | any) =>
    typeof answer === 'string' ? <p>{answer}</p> : <RichText data={answer} />

  const renderFilters = () => (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Поиск по вопросам..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80',
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <GridContainer settings={settings}>
      {(heading || subheading) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {heading && <h2 className="text-3xl font-bold mb-4">{heading}</h2>}
          {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        </motion.div>
      )}

      {renderFilters()}

      <AnimatePresence mode="wait">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            Ничего не найдено
          </motion.div>
        ) : layout === 'accordion' ? (
          <div className="max-w-3xl mx-auto w-full">
            <Accordion type="single" collapsible className="w-full">
              {filteredItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div>
                      <span>{item.question}</span>
                      {item.category && (
                        <span className="ml-2 text-xs text-muted-foreground">{item.category}</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>{renderAnswer(item.answer)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  'p-6 rounded-lg border border-border bg-card transition-all duration-200',
                  'hover:shadow-md cursor-pointer',
                  openItems[index] && 'ring-2 ring-primary',
                )}
                onClick={() => toggleItem(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleItem(index)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-medium">{item.question}</h3>
                    {item.category && (
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200',
                      openItems[index] && 'rotate-180',
                    )}
                  />
                </div>
                <div
                  className={cn(
                    'overflow-hidden transition-all',
                    openItems[index] ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0',
                  )}
                >
                  {renderAnswer(item.answer)}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {filteredItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'border-b border-border pb-6',
                  'hover:bg-muted/50 rounded-lg p-4 -mx-4 cursor-pointer transition-colors',
                )}
                onClick={() => toggleItem(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleItem(index)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-medium">{item.question}</h3>
                    {item.category && (
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200',
                      openItems[index] && 'rotate-180',
                    )}
                  />
                </div>
                <div
                  className={cn(
                    'overflow-hidden transition-all',
                    openItems[index] ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0',
                  )}
                >
                  {renderAnswer(item.answer)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </GridContainer>
  )
}

export const FaqBlock = FAQ
export default FAQ
