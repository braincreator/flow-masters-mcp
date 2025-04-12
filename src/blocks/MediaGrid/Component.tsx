'use client'
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { MediaGridBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Film,
} from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

const variants = {
  grid: {
    container: 'grid gap-4',
    cols: {
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-2 lg:grid-cols-4',
    },
  },
  masonry: {
    container: 'columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4',
    item: 'break-inside-avoid',
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

const filterTypes = [
  { id: 'all', label: 'Все', icon: null },
  { id: 'image', label: 'Изображения', icon: ImageIcon },
  { id: 'video', label: 'Видео', icon: Film },
]

export const MediaGrid: React.FC<MediaGridBlock> = ({
  items,
  variant = 'grid',
  columns = 3,
  settings,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return []
    if (selectedFilter === 'all') return items
    return items.filter((item) => item.media.type === selectedFilter)
  }, [items, selectedFilter])

  const handlePrevious = () => {
    if (!Array.isArray(items) || filteredItems.length === 0) return
    setSelectedIndex((current) => {
      if (current === null) return null
      return current === 0 ? filteredItems.length - 1 : current - 1
    })
  }

  const handleNext = () => {
    if (!Array.isArray(items) || filteredItems.length === 0) return
    setSelectedIndex((current) => {
      if (current === null) return null
      return current === filteredItems.length - 1 ? 0 : current + 1
    })
  }

  useHotkeys('left', handlePrevious, { enabled: selectedIndex !== null })
  useHotkeys('right', handleNext, { enabled: selectedIndex !== null })
  useHotkeys('esc', () => setSelectedIndex(null), { enabled: selectedIndex !== null })
  useHotkeys('space', () => setIsZoomed((prev) => !prev), { enabled: selectedIndex !== null })

  useEffect(() => {
    setIsZoomed(false)
  }, [selectedIndex])

  const renderGalleryControls = () => (
    <div className="absolute inset-0 flex items-center justify-between p-4">
      <Button
        variant="outline"
        size="icon"
        className="bg-white/90 hover:bg-white"
        onClick={handlePrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-white/90 hover:bg-white"
        onClick={handleNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )

  const renderMediaItem = (item, index: number) => {
    const mediaContent = (
      <div className="relative group">
        <div
          className={cn(
            'relative overflow-hidden rounded-lg',
            variant === 'grid' ? 'aspect-square' : 'aspect-auto',
          )}
        >
          <Media
            resource={item.media}
            className={cn(
              'object-cover transition-transform duration-300',
              'group-hover:scale-105',
            )}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {item.media.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Film className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        {item.caption && (
          <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-sm text-white p-4 text-center">{item.caption}</p>
          </div>
        )}
      </div>
    )

    if (variant === 'masonry') {
      return (
        <motion.div
          key={index}
          className={variants.masonry.item}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
          onClick={() => setSelectedIndex(index)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedIndex(index)}
        >
          {mediaContent}
        </motion.div>
      )
    }

    return (
      <motion.div
        key={index}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: index * 0.1 }}
        onClick={() => setSelectedIndex(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setSelectedIndex(index)}
      >
        {mediaContent}
      </motion.div>
    )
  }

  const renderFilters = () => (
    <div className="flex gap-2 mb-6 flex-wrap">
      {filterTypes.map((filter) => (
        <Button
          key={filter.id}
          variant={selectedFilter === filter.id ? 'default' : 'outline'}
          onClick={() => setSelectedFilter(filter.id)}
          className="gap-2"
        >
          {filter.icon && <filter.icon className="w-4 h-4" />}
          {filter.label}
        </Button>
      ))}
    </div>
  )

  return (
    <GridContainer settings={settings}>
      {renderFilters()}

      <AnimatePresence mode="wait">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 text-muted-foreground"
          >
            Нет медиафайлов выбранного типа
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              variant === 'grid'
                ? [variants.grid.container, variants.grid.cols[columns]]
                : variants.masonry.container,
            )}
          >
            {filteredItems.map((item, index) => renderMediaItem(item, index))}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-screen-lg p-0">
          <AnimatePresence mode="wait">
            {selectedIndex !== null && (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <div
                  className={cn('aspect-[16/9] relative overflow-hidden', {
                    'cursor-zoom-out': isZoomed,
                    'cursor-zoom-in': !isZoomed,
                  })}
                  onClick={() => setIsZoomed((prev) => !prev)}
                >
                  <Media
                    resource={filteredItems[selectedIndex].media}
                    className={cn('object-contain transition-transform duration-300', {
                      'scale-150': isZoomed,
                    })}
                    fill
                    sizes="90vw"
                    priority
                  />
                </div>
                {filteredItems[selectedIndex].caption && (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    {filteredItems[selectedIndex].caption}
                  </p>
                )}
                {renderGalleryControls()}
                {filteredItems[selectedIndex].media.type === 'image' && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 left-2 bg-white/90 hover:bg-white"
                    onClick={() => setIsZoomed((prev) => !prev)}
                  >
                    {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </GridContainer>
  )
}

export const MediaGridBlock = MediaGrid
export default MediaGrid
