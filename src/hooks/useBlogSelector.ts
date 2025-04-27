'use client'

import { useContext } from 'react'
import { BlogContext } from '@/providers/BlogProvider'

/**
 * Custom hook to select specific parts of the blog context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 * 
 * @param selector A function that selects specific parts of the blog context
 * @returns The selected parts of the blog context
 */
export function useBlogSelector<T>(selector: (context: any) => T): T {
  const context = useContext(BlogContext)
  
  if (context === undefined) {
    throw new Error('useBlogSelector must be used within a BlogProvider')
  }
  
  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the posts-related state from the blog context
 */
export function useBlogPosts() {
  return useBlogSelector(context => ({
    posts: context.posts,
    featuredPost: context.featuredPost,
    relatedPosts: context.relatedPosts,
    isLoading: context.isLoading,
    error: context.error,
    fetchPosts: context.fetchPosts,
    fetchPostBySlug: context.fetchPostBySlug,
  }))
}

/**
 * Select only the comments-related state from the blog context
 */
export function useBlogComments() {
  return useBlogSelector(context => ({
    comments: context.comments,
    isLoadingComments: context.isLoadingComments,
    commentError: context.commentError,
    fetchComments: context.fetchComments,
    addComment: context.addComment,
  }))
}

/**
 * Select only the search-related state from the blog context
 */
export function useBlogSearch() {
  return useBlogSelector(context => ({
    searchQuery: context.searchQuery,
    searchResults: context.searchResults,
    isSearching: context.isSearching,
    searchError: context.searchError,
    searchPosts: context.searchPosts,
    setSearchQuery: context.setSearchQuery,
  }))
}

/**
 * Select only the user interaction state from the blog context
 */
export function useBlogInteractions() {
  return useBlogSelector(context => ({
    favorites: context.favorites,
    readingHistory: context.readingHistory,
    toggleFavorite: context.toggleFavorite,
    isFavorite: context.isFavorite,
    trackPostView: context.trackPostView,
    trackReadingProgress: context.trackReadingProgress,
    sharePost: context.sharePost,
  }))
}
