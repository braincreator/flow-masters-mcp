/**
 * API utility functions that work with our context providers
 * These functions handle common API operations and integrate with our context providers
 */

import { useCache, CacheContextType } from '@/providers/CacheProvider'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Generic fetch function that integrates with our CacheProvider
 * @param url The URL to fetch
 * @param options Fetch options
 * @param cacheKey Optional cache key
 * @param cacheTTL Optional cache TTL in seconds
 * @returns The fetch response
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  cacheTTL?: number,
  cacheInstance?: CacheContextType, // Add cacheInstance parameter with correct type
): Promise<T> {
  // If we're in a browser environment and have a cache key, check the cache
  if (typeof window !== 'undefined' && cacheKey && cacheInstance) {
    // Use cacheInstance
    const cachedData = cacheInstance.get<T>(cacheKey)
    if (cachedData) {
      return cachedData
    }
  }

  // Fetch the data
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    logDebug('API error response:', error)
    throw new Error(error.error || error.message || `API error: ${response.status}`)
  }

  // Parse the response
  const data = await response.json()

  // If we're in a browser environment and have a cache key, cache the data
  if (typeof window !== 'undefined' && cacheKey && cacheInstance) {
    // Use cacheInstance
    cacheInstance.set(cacheKey, data, cacheTTL)
  }

  return data
}

/**
 * Blog API functions
 */
export const blogApi = {
  /**
   * Fetch blog posts
   * @param options Options for fetching posts
   * @returns Blog posts
   */
  async getPosts(options: any = {}) {
    const {
      page = 1,
      limit = 10,
      categorySlug = '',
      tagSlug = '',
      authorId = '',
      locale = 'en',
      sort = '-publishedAt',
    } = options

    // Build query parameters
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    params.append('locale', locale)
    params.append('sort', sort)

    if (categorySlug) params.append('category', categorySlug)
    if (tagSlug) params.append('tag', tagSlug)
    if (authorId) params.append('author', authorId)

    // Generate cache key
    const cacheKey = `blog-posts-${params.toString()}`

    // Fetch posts
    return apiFetch(`/api/v1/blog/posts?${params.toString()}`, {}, cacheKey, 300) // Cache for 5 minutes
  },

  /**
   * Fetch a single blog post by slug
   * @param slug Post slug
   * @param locale Locale
   * @returns Blog post
   */
  async getPostBySlug(slug: string, locale = 'en') {
    // Generate cache key
    const cacheKey = `blog-post-${slug}-${locale}`

    // Fetch post
    return apiFetch(`/api/v1/blog/posts/${slug}?locale=${locale}`, {}, cacheKey, 300) // Cache for 5 minutes
  },

  /**
   * Search blog posts
   * @param query Search query
   * @returns Search results
   */
  async searchPosts(query: string) {
    if (!query || query.trim().length < 2) {
      return { docs: [] }
    }

    // Generate cache key
    const cacheKey = `blog-search-${query}`

    // Fetch search results
    return apiFetch(`/api/v1/blog/search?q=${encodeURIComponent(query)}`, {}, cacheKey, 60) // Cache for 1 minute
  },

  /**
   * Fetch comments for a post
   * @param postId Post ID
   * @returns Comments
   */
  async getComments(postId: string) {
    // Generate cache key
    const cacheKey = `blog-comments-${postId}`

    // Fetch comments
    return apiFetch(`/api/v1/blog/comment?postId=${postId}`, {}, cacheKey, 60) // Cache for 1 minute
  },

  /**
   * Add a comment to a post
   * @param postId Post ID
   * @param content Comment content
   * @param author Comment author
   * @param parentCommentId Optional parent comment ID
   * @returns Added comment
   */
  async addComment(postId: string, content: string, author: any, parentCommentId?: string) {
    // Prepare comment data
    const commentData: any = {
      postId,
      content,
      author,
    }

    if (parentCommentId) {
      commentData.parentComment = parentCommentId
    }

    logDebug('blogApi.addComment sending:', JSON.stringify(commentData, null, 2))

    // Submit comment
    return apiFetch('/api/v1/blog/comment', {
      method: 'POST',
      body: JSON.stringify(commentData),
    })
  },

  /**
   * Track post view
   * @param slug Post slug
   */
  async trackPostView(slug: string) {
    return apiFetch('/api/v1/blog/post-view', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    })
  },

  /**
   * Track post metrics
   * @param postId Post ID
   * @param action Metric action
   * @param data Additional data
   */
  async trackMetrics(postId: string, action: string, data: any = {}) {
    return apiFetch('/api/v1/blog/metrics', {
      method: 'POST',
      body: JSON.stringify({
        postId,
        action,
        ...data,
      }),
    })
  },
}

/**
 * Search API functions
 */
export const searchApi = {
  /**
   * Search all content
   * @param query Search query
   * @param filters Search filters
   * @param locale Locale
   * @returns Search results
   */
  async search(query: string, filters: any = {}, locale = 'en', cacheInstance?: CacheContextType) {
    if (!query || query.trim().length < 2) {
      return { results: [], totalResults: 0 }
    }

    // Build query parameters
    const params = new URLSearchParams()
    params.append('q', query)
    params.append('locale', locale)

    // Add filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }

    // Generate cache key
    const cacheKey = `search-${params.toString()}`

    // Fetch search results
    return apiFetch(`/api/v1/search?${params.toString()}`, {}, cacheKey, 60, cacheInstance) // Cache for 1 minute, pass cacheInstance
  },

  /**
   * Get search suggestions
   * @param input Search input
   * @returns Search suggestions
   */
  async getSuggestions(input: string, cacheInstance?: CacheContextType) {
    if (!input || input.trim().length < 2) {
      return { suggestions: [] }
    }

    // Generate cache key
    const cacheKey = `search-suggestions-${input}`

    // Fetch search suggestions
    return apiFetch(
      `/api/v1/search/suggestions?q=${encodeURIComponent(input)}`,
      {},
      cacheKey,
      60,
      cacheInstance,
    ) // Cache for 1 minute, pass cacheInstance
  },
}

/**
 * Locale API functions
 */
export const localeApi = {
  /**
   * Get translations for a locale
   * @param locale Locale
   * @param namespace Optional namespace
   * @returns Translations
   */
  async getTranslations(locale: string, namespace?: string) {
    // Build query parameters
    const params = new URLSearchParams()
    if (namespace) {
      params.append('namespace', namespace)
    }

    // Generate cache key
    const cacheKey = `translations-${locale}${namespace ? `-${namespace}` : ''}`

    // Fetch translations
    return apiFetch(`/api/v1/translations/${locale}?${params.toString()}`, {}, cacheKey, 3600) // Cache for 1 hour
  },
}
