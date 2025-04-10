'use client'
'use client'

import React, { useState, useRef, useCallback } from 'react'
import { BaseBlock } from '@/components/BaseBlock'
import { motion, AnimatePresence } from 'framer-motion'
import type { TabsBlock as TabsBlockType } from '@/types/blocks'
import type { BlockStyleProps } from '@/types/block-styles'
import { blockSizeStyles, blockStyleVariants, blockAnimationStyles } from '@/styles/block-styles'
import { cn } from '@/lib/utils'
import RichText from '@/components/RichText'
import Image from 'next/image'
import { Tabs as UiTabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TabsProps extends TabsBlockType, BlockStyleProps {}

const variants = {
  default: 'border-b border-border',
  pills: 'p-1 bg-muted rounded-lg',
  boxed: 'border border-border rounded-lg overflow-hidden',
}

const tabStyles = {
  default: {
    list: 'flex gap-2',
    tab: 'px-4 py-2 border-b-2 border-transparent hover:text-foreground transition-colors',
    active: 'border-primary text-foreground',
    inactive: 'text-muted-foreground',
  },
  pills: {
    list: 'flex gap-1',
    tab: 'px-3 py-1.5 rounded-md hover:bg-background/50 transition-colors',
    active: 'bg-background text-foreground shadow-sm',
    inactive: 'text-muted-foreground',
  },
  boxed: {
    list: 'flex',
    tab: 'flex-1 px-4 py-2 text-center border-b border-border hover:bg-muted/50 transition-colors',
    active: 'bg-background text-foreground border-b-0 shadow-[0_1px_0_0] shadow-background',
    inactive: 'text-muted-foreground bg-muted/30',
  },
}

export const TabsComponent: React.FC<TabsProps> = ({
  items,
  settings,
  className,
  style = 'default',
  size = 'md',
  variant = 'default',
  defaultTab = 0,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const tabsRef = useRef<HTMLDivElement>(null)

  const sizeVariant = blockSizeStyles[size]
  const styleVariant = blockStyleVariants[style]
  const tabVariant = tabStyles[variant]

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const tabCount = items?.length || 0

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setActiveTab((prev) => (prev - 1 + tabCount) % tabCount)
          break
        case 'ArrowRight':
          e.preventDefault()
          setActiveTab((prev) => (prev + 1) % tabCount)
          break
        case 'Home':
          e.preventDefault()
          setActiveTab(0)
          break
        case 'End':
          e.preventDefault()
          setActiveTab(tabCount - 1)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          setActiveTab(index)
          break
      }
    },
    [items],
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
        <div
          ref={tabsRef}
          className={cn('w-full', variants[variant])}
          role="tablist"
          aria-orientation="horizontal"
        >
          <div className={tabVariant.list}>
            {items.map((item, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={activeTab === index}
                aria-controls={`panel-${index}`}
                tabIndex={activeTab === index ? 0 : -1}
                className={cn(
                  tabVariant.tab,
                  activeTab === index ? tabVariant.active : tabVariant.inactive,
                )}
                onClick={() => setActiveTab(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {item.label}
                {variant === 'pills' && (
                  <motion.div
                    className="absolute inset-0 bg-background rounded-md -z-10"
                    layoutId="active-tab"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={sizeVariant.content}
            >
              {items[activeTab].content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </BaseBlock>
  )
}

export default TabsComponent
