'use client'

import React, { createContext, useContext, useState } from 'react'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

interface PayloadAPIContextType {
  fetchPosts: (options: FetchPostsOptions) => Promise<any>
  fetchCategories: (options: FetchTaxonomyOptions) => Promise<any>
  fetchTags: (options: FetchTaxonomyOptions) => Promise<any>
  isLoading: boolean
  error: string | null
}

interface FetchPostsOptions {
  locale?: Locale
  page?: number
  limit?: number
  searchQuery?: string
  categorySlug?: string
  tagSlug?: string
  authorId?: string
}

interface FetchTaxonomyOptions {
  locale?: Locale
}

const PayloadAPIContext = createContext<PayloadAPIContextType | undefined>(undefined)

export function PayloadAPIClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async ({
    locale = DEFAULT_LOCALE,
    page = 1,
    limit = 10,
    searchQuery = '',
    categorySlug = '',
    tagSlug = '',
    authorId = '',
  }: FetchPostsOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(
        `Client: Fetching posts for locale ${locale}, page ${page}, limit ${limit}, depth 2`,
      )
      // Construct API query params
      const params = new URLSearchParams()
      params.set('locale', locale)
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      params.set('depth', '2')

      if (searchQuery) params.set('search', searchQuery)
      if (categorySlug) params.set('category', categorySlug)
      if (tagSlug) params.set('tag', tagSlug)
      if (authorId) params.set('author', authorId)

      const url = `/api/v1/posts?${params.toString()}`
      console.log(`Client: Sending request to ${url}`)

      // Make the API request
      const response = await fetch(url)
      console.log(`Client: Received response with status ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Client: API error response:`, errorText)
        throw new Error(`API error: ${response.status}. Details: ${errorText}`)
      }

      const data = await response.json()
      console.log(`Client: Successfully parsed JSON response with ${data.docs?.length} posts`)
      return data
    } catch (err) {
      console.error('Client: Error in fetchPosts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async ({ locale = DEFAULT_LOCALE }: FetchTaxonomyOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Client: Fetching categories for locale ${locale}`)
      const params = new URLSearchParams({ limit: '100' })

      const url = `/api/v1/categories?${params.toString()}`
      console.log(`Client: Sending request to ${url}`)

      const response = await fetch(url)
      console.log(`Client: Received response with status ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Client: API error response:`, errorText)
        throw new Error(`API error: ${response.status}. Details: ${errorText}`)
      }

      const data = await response.json()
      console.log(`Client: Successfully parsed JSON response with ${data.length} categories`)
      return data
    } catch (err) {
      console.error('Client: Error in fetchCategories:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTags = async ({ locale = DEFAULT_LOCALE }: FetchTaxonomyOptions) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Client: Fetching tags for locale ${locale}`)
      const params = new URLSearchParams({ limit: '100' })

      const url = `/api/v1/tags?${params.toString()}`
      console.log(`Client: Sending request to ${url}`)

      const response = await fetch(url)
      console.log(`Client: Received response with status ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Client: API error response:`, errorText)
        throw new Error(`API error: ${response.status}. Details: ${errorText}`)
      }

      const data = await response.json()
      console.log(`Client: Successfully parsed JSON response with ${data.length} tags`)
      return data
    } catch (err) {
      console.error('Client: Error in fetchTags:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tags')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    fetchPosts,
    fetchCategories,
    fetchTags,
    isLoading,
    error,
  }

  return <PayloadAPIContext.Provider value={value}>{children}</PayloadAPIContext.Provider>
}

export function usePayloadAPI() {
  const context = useContext(PayloadAPIContext)

  if (context === undefined) {
    throw new Error('usePayloadAPI must be used within a PayloadAPIProvider')
  }

  return context
}
