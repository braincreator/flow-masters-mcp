'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useRef } from 'react'
import { cn } from '@/utilities/ui'

export const VirtualList = ({ items, renderItem, itemHeight = 50, overscan = 3, className }) => {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan, // Reduced default from 5 to 3 for better memory usage
  })

  return (
    <div
      ref={parentRef}
      className={cn('h-full overflow-auto', className)}
      style={{ contain: 'strict', minHeight: 'calc(100vh - 200px)' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              width: '100%',
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
