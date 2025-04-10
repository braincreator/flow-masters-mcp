"use client"
'use client'

import React, { useState, useCallback } from 'react'
import { BaseBlock } from '@/components/BaseBlock'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AccordionBlock as AccordionBlockType } from '@/types/blocks'
import type { BlockStyleProps } from '@/types/block-styles'
import { blockSizeStyles, blockStyleVariants } from '@/styles/block-styles'
import { cn } from '@/lib/utils'

interface AccordionProps extends AccordionBlockType, BlockStyleProps {}

const variants = {
  default: 'divide-y divide-border',
  separated: 'space-y-2',
  boxed: 'border border-border rounded-lg overflow-hidden divide-y divide-border',
}

const itemStyles = {
  default: {
    trigger:
      'flex w-full items-center justify-between py-4 text-base font-medium transition-all hover:text-foreground',
    content: 'pb-4 pt-0',
    icon: 'h-4 w-4 shrink-0 transition-transform duration-200',
  },
  separated: {
    trigger:
      'flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-base font-medium transition-all hover:bg-muted/50',
    content: 'px-4 pb-4 pt-2',
    icon: 'h-4 w-4 shrink-0 transition-transform duration-200',
  },
  boxed: {
    trigger:
      'flex w-full items-center justify-between px-4 py-3 text-base font-medium transition-all hover:bg-muted/50',
    content: 'px-4 pb-4 pt-0',
    icon: 'h-4 w-4 shrink-0 transition-transform duration-200',
  },
}

const AccordionItem = ({ item, isOpen, onToggle, variant, allowMultiple, level = 0 }) => {
  const itemVariant = itemStyles[variant]
  const hasNestedItems = item.items && item.items.length > 0
  const [openItems, setOpenItems] = useState<number[]>([])

  const handleNestedToggle = useCallback(
    (index: number) => {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : allowMultiple
            ? [...prev, index]
            : [index],
      )
    },
    [allowMultiple],
  )

  return (
    <div className={cn('overflow-hidden', level > 0 && 'ml-4')}>
      <button
        className={itemVariant.trigger}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`content-${item.id}`}
      >
        <span>{item.label}</span>
        <ChevronDown className={cn(itemVariant.icon, isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`content-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={itemVariant.content}>
              {item.content}
              {hasNestedItems && (
                <div className={cn(variants[variant], 'mt-4')}>
                  {item.items.map((nestedItem, index) => (
                    <AccordionItem
                      key={index}
                      item={nestedItem}
                      isOpen={openItems.includes(index)}
                      onToggle={() => handleNestedToggle(index)}
                      variant={variant}
                      allowMultiple={allowMultiple}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  settings,
  className,
  style = 'default',
  size = 'md',
  variant = 'default',
  allowMultiple = false,
  defaultOpen = [],
}) => {
  const [openItems, setOpenItems] = useState<number[]>(defaultOpen)

  const sizeVariant = blockSizeStyles[size]
  const styleVariant = blockStyleVariants[style]

  const handleToggle = useCallback(
    (index: number) => {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : allowMultiple
            ? [...prev, index]
            : [index],
      )
    },
    [allowMultiple],
  )

  if (!items?.length) {
    return null
  }

  return (
    <BaseBlock settings={settings}>
      <div
        className={cn(
          'w-full',
          styleVariant.background,
          styleVariant.text,
          styleVariant.border,
          styleVariant.shadow,
          sizeVariant.container,
          className,
        )}
      >
        <div className={variants[variant]}>
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={openItems.includes(index)}
              onToggle={() => handleToggle(index)}
              variant={variant}
              allowMultiple={allowMultiple}
            />
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const AccordionBlock = Accordion
export default Accordion
