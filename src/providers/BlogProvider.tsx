'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

// Define types for blog posts
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: any
  publishedAt?: string
  heroImage?: {
    url: string
    alt: string
  }
  author?: {
    id: string
    name: string
    slug?: string
    avatar?: string
  }
  categories?: {
    id: string
    title: string
    slug: string
  }[]
  tags?: {
    id: string
    title: string
    slug: string
  }[]
  readTime?: number
}

// Define types for comments
export interface Comment {
  id: string
  content: string
  author: {
    name: string
    email?: string
    avatar?: string
  }
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  replies?: Comment[]
  parentComment?: string
}

// Define the context type
interface BlogContextType {
  // Posts state
  posts: BlogPost[]
  featuredPost: BlogPost | null
  relatedPosts: BlogPost[]
  isLoading: boolean
  error: string | null

  // Search state
  searchQuery: string
  searchResults: BlogPost[]
  isSearching: boolean
  searchError: string | null

  // Comments state
  comments: Comment[]
  isLoadingComments: boolean
  commentError: string | null

  // User interaction state
  favorites: string[]
  readingHistory: string[]

  // Methods
  fetchPosts: (options?: FetchPostsOptions) => Promise<void>
  fetchPostBySlug: (slug: string, locale?: string) => Promise<BlogPost | null>
  searchPosts: (query: string) => Promise<void>
  setSearchQuery: (query: string) => void
  addComment: (postId: string, content: string, parentCommentId?: string) => Promise<boolean>
  fetchComments: (postId: string) => Promise<void>
  toggleFavorite: (postId: string) => void
  isFavorite: (postId: string) => boolean
  trackPostView: (slug: string) => Promise<void>
  trackReadingProgress: (postId: string, progress: number) => Promise<void>
  sharePost: (postId: string, platform: string) => Promise<void>
}

// Options for fetching posts
interface FetchPostsOptions {
  page?: number
  limit?: number
  categorySlug?: string
  tagSlug?: string
  authorId?: string
  locale?: string
  sort?: string
}

// Create the context
export const BlogContext = createContext<BlogContextType | undefined>(undefined)

// Provider component
export function BlogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // Posts state
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BlogPost[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  // User interaction state
  const [favorites, setFavorites] = useState<string[]>([])
  const [readingHistory, setReadingHistory] = useState<string[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem('blog-favorites')
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites))
        }

        const storedHistory = localStorage.getItem('blog-reading-history')
        if (storedHistory) {
          setReadingHistory(JSON.parse(storedHistory))
        }
      } catch (err) {
        console.error('Error loading blog data from localStorage:', err)
      }
    }
  }, [])

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && favorites.length > 0) {
      localStorage.setItem('blog-favorites', JSON.stringify(favorites))
    }
  }, [favorites])

  // Save reading history to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && readingHistory.length > 0) {
      localStorage.setItem('blog-reading-history', JSON.stringify(readingHistory))
    }
  }, [readingHistory])

  // Fetch posts with options
  const fetchPosts = useCallback(
    async (options: FetchPostsOptions = {}) => {
      const {
        page = 1,
        limit = 10,
        categorySlug = '',
        tagSlug = '',
        authorId = '',
        locale = 'en',
        sort = '-publishedAt',
      } = options

      setIsLoading(true)
      setError(null)

      try {
        // Import the API utility functions dynamically to avoid circular dependencies
        const { blogApi } = await import('@/lib/api')

        // Fetch posts using the API utility function
        const data = await blogApi.getPosts({
          page,
          limit,
          categorySlug,
          tagSlug,
          authorId,
          locale,
          sort,
        })

        setPosts(data.docs || [])

        // Set featured post if available and not already set
        if (data.docs && data.docs.length > 0) {
          setFeaturedPost((prev) => prev || data.docs[0])
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching posts')
      } finally {
        setIsLoading(false)
      }
    },
    [], // Removed featuredPost dependency
  )

  // Fetch a single post by slug
  const fetchPostBySlug = useCallback(
    async (slug: string, locale = 'en'): Promise<BlogPost | null> => {
      setIsLoading(true)
      setError(null)

      try {
        // Import the API utility functions dynamically to avoid circular dependencies
        const { blogApi } = await import('@/lib/api')

        // Fetch post using the API utility function
        const post = await blogApi.getPostBySlug(slug, locale)

        // Track this post in reading history
        if (post && post.id) {
          setReadingHistory((prev) => {
            const newHistory = [post.id, ...prev.filter((id) => id !== post.id)].slice(0, 20)
            return newHistory
          })
        }

        return post
      } catch (err) {
        console.error(`Error fetching blog post with slug "${slug}":`, err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the post')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  // Search posts
  const searchPosts = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      // Import the API utility functions dynamically to avoid circular dependencies
      const { blogApi } = await import('@/lib/api')

      // Search posts using the API utility function
      const data = await blogApi.searchPosts(query)
      setSearchResults(data.docs || [])
    } catch (err) {
      console.error('Error searching blog posts:', err)
      setSearchError(err instanceof Error ? err.message : 'An error occurred while searching')
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Fetch comments for a post
  const fetchComments = useCallback(async (postId: string) => {
    setIsLoadingComments(true)
    setCommentError(null)

    try {
      // Import the API utility functions dynamically to avoid circular dependencies
      const { blogApi } = await import('@/lib/api')

      // Fetch comments using the API utility function
      const data = await blogApi.getComments(postId)
      setComments(data.comments || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setCommentError(
        err instanceof Error ? err.message : 'An error occurred while loading comments',
      )
    } finally {
      setIsLoadingComments(false)
    }
  }, [])

  // Add a comment to a post (only for authenticated users)
  const addComment = useCallback(
    async (postId: string, content: string, parentCommentId?: string) => {
      // Only handle authenticated users - guest comments should use the fallback in CommentForm
      if (!user || !user.email) {
        console.warn(
          'BlogProvider.addComment called without authenticated user - falling back to CommentForm direct API call',
        )
        return false
      }

      setIsLoadingComments(true)
      setCommentError(null)

      try {
        // Import the API utility functions dynamically to avoid circular dependencies
        const { blogApi } = await import('@/lib/api')

        // Prepare author data from authenticated user
        const author = {
          name: user.name,
          email: user.email,
        }

        // Submit comment using the API utility function
        await blogApi.addComment(postId, content, author, parentCommentId)

        // Refresh comments after adding a new one
        await fetchComments(postId)
        return true
      } catch (err) {
        console.error('Error adding comment:', err)
        setCommentError(
          err instanceof Error ? err.message : 'An error occurred while submitting your comment',
        )
        return false
      } finally {
        setIsLoadingComments(false)
      }
    },
    [user, fetchComments],
  )

  // Toggle a post as favorite
  const toggleFavorite = useCallback((postId: string) => {
    setFavorites((prev) => {
      if (prev.includes(postId)) {
        return prev.filter((id) => id !== postId)
      } else {
        return [...prev, postId]
      }
    })
  }, [])

  // Check if a post is in favorites
  const isFavorite = useCallback(
    (postId: string) => {
      return favorites.includes(postId)
    },
    [favorites],
  )

  // Track post view
  const trackPostView = useCallback(async (slug: string) => {
    try {
      // Import the API utility functions dynamically to avoid circular dependencies
      const { blogApi } = await import('@/lib/api')

      // Track post view using the API utility function
      await blogApi.trackPostView(slug)
    } catch (err) {
      console.error('Error tracking post view:', err)
    }
  }, [])

  // Track reading progress
  const trackReadingProgress = useCallback(async (postId: string, progress: number) => {
    try {
      // Import the API utility functions dynamically to avoid circular dependencies
      const { blogApi } = await import('@/lib/api')

      // Track reading progress using the API utility function
      await blogApi.trackMetrics(postId, 'progress', { progress })
    } catch (err) {
      console.error('Error tracking reading progress:', err)
    }
  }, [])

  // Share post
  const sharePost = useCallback(async (postId: string, platform: string) => {
    try {
      // Import the API utility functions dynamically to avoid circular dependencies
      const { blogApi } = await import('@/lib/api')

      // Track share using the API utility function
      await blogApi.trackMetrics(postId, 'share', { platform })
    } catch (err) {
      console.error(`Error tracking share on ${platform}:`, err)
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchPosts(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchPosts])

  // Memoize context value to prevent unnecessary re-renders
  const value = React.useMemo(
    () => ({
      // State
      posts,
      featuredPost,
      relatedPosts,
      isLoading,
      error,
      searchQuery,
      searchResults,
      isSearching,
      searchError,
      comments,
      isLoadingComments,
      commentError,
      favorites,
      readingHistory,

      // Methods
      fetchPosts,
      fetchPostBySlug,
      searchPosts,
      setSearchQuery,
      addComment,
      fetchComments,
      toggleFavorite,
      isFavorite,
      trackPostView,
      trackReadingProgress,
      sharePost,
    }),
    [
      posts,
      featuredPost,
      relatedPosts,
      isLoading,
      error,
      searchQuery,
      searchResults,
      isSearching,
      searchError,
      comments,
      isLoadingComments,
      commentError,
      favorites,
      readingHistory,
      fetchPosts,
      fetchPostBySlug,
      searchPosts,
      setSearchQuery,
      addComment,
      fetchComments,
      toggleFavorite,
      isFavorite,
      trackPostView,
      trackReadingProgress,
      sharePost,
    ],
  )

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>
}

// Custom hook to use the blog context
export function useBlog() {
  const context = useContext(BlogContext)
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider')
  }
  return context
}
