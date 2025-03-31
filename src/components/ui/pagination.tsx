'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/utilities/ui'

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
    <nav
      className={cn('flex justify-center items-center gap-1', className)}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {pageRange.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className="w-9 h-9"
          >
            {page}
          </Button>
        ),
      )}

      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
