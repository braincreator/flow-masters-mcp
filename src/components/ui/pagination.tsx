'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  maxVisiblePages?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Calculate the range of page numbers to display
  const getPageRange = () => {
    // If we can show all pages, just return the full array
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first and last pages
    const pages: (number | 'ellipsis')[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)

    // Determine start and end of the range
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    // Adjust if we're near the start or end
    if (currentPage <= halfVisible) {
      endPage = maxVisiblePages
    } else if (currentPage >= totalPages - halfVisible) {
      startPage = totalPages - maxVisiblePages + 1
    }

    // Add first page
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) pages.push('ellipsis')
    }

    // Add range of pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('ellipsis')
      pages.push(totalPages)
    }

    return pages
  }

  const pageRange = getPageRange()

  return (
    <motion.nav
      className={cn('flex justify-center items-center gap-1.5 py-2', className)}
      aria-label="Pagination"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Previous button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors duration-200"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`page-${currentPage}`}
          className="flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {pageRange.map((page, index) =>
            page === 'ellipsis' ? (
              <motion.span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 1.5,
                  repeatDelay: 0.5,
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </motion.span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
                className={cn(
                  'w-8 h-8 rounded-md font-medium transition-all duration-200',
                  currentPage === page
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/25 hover:bg-primary/90'
                    : 'hover:border-primary/30 text-muted-foreground hover:text-foreground',
                )}
              >
                {page}
              </Button>
            ),
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors duration-200"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </motion.nav>
  )
}
