'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Create placeholder components first
// These will be implemented later

export function SearchBar({ placeholder = 'Search...', onSearch }: any) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-10 px-4 py-2 border rounded-md"
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  )
}

export function SearchResults({ results = [] }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Search Results</h3>
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result: any) => (
            <div key={result.id} className="p-4 border rounded-md">
              <h4 className="font-medium">{result.title}</h4>
              <p className="text-sm">{result.excerpt}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No results found</p>
      )}
    </div>
  )
}

export function SearchFilters({ filters = {}, onFilterChange }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Filters</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="filter-posts"
            checked={filters.posts}
            onChange={() => onFilterChange?.({ ...filters, posts: !filters.posts })}
          />
          <label htmlFor="filter-posts" className="ml-2">
            Posts
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="filter-pages"
            checked={filters.pages}
            onChange={() => onFilterChange?.({ ...filters, pages: !filters.pages })}
          />
          <label htmlFor="filter-pages" className="ml-2">
            Pages
          </label>
        </div>
      </div>
    </div>
  )
}

export function SearchHistory({ history = [], onClear, onSelect }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Searches</h3>
        {history.length > 0 && (
          <button className="text-sm text-blue-500 hover:underline" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {history.length > 0 ? (
        <div className="space-y-2">
          {history.map((item: any, index: number) => (
            <div
              key={index}
              className="p-2 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => onSelect?.(item.query)}
            >
              <p>{item.query}</p>
              <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No recent searches</p>
      )}
    </div>
  )
}

// Lazy-loaded search components with appropriate loading skeletons
// Now that components are defined above, we can reference them

export const LazySearchBar = dynamic(() => Promise.resolve({ default: SearchBar }), {
  loading: () => <Skeleton className="h-10 w-full rounded-md" />,
  ssr: false,
})

export const LazySearchResults = dynamic(() => Promise.resolve({ default: SearchResults }), {
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false,
})

export const LazySearchFilters = dynamic(() => Promise.resolve({ default: SearchFilters }), {
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/4" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </div>
  ),
  ssr: false,
})

export const LazySearchHistory = dynamic(() => Promise.resolve({ default: SearchHistory }), {
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </div>
  ),
  ssr: false,
})
