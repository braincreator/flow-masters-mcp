'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlogSearch } from '@/components/blog/BlogSearch'

export const Search: React.FC = () => {
  const [query, setValue] = useState('')
  const router = useRouter()

  const handleSearch = (value: string) => {
    setValue(value)
    router.push(`/search${value ? `?q=${encodeURIComponent(value)}` : ''}`)
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <BlogSearch
        initialQuery={query}
        onSearch={handleSearch}
        placeholder="Search everything..."
        className="w-full"
        variant="product-style"
        size="lg"
        showClearButton={true}
      />
    </div>
  )
}
