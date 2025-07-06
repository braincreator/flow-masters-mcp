'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl' // Import useTranslations
import debounce from 'lodash.debounce'
import { useDebounce } from '@/hooks/useDebounce'
import React from 'react'

import '@/components/blog/enhanced-blog.css'
import { PaginatedDocs } from 'payload'
import { cn } from '@/lib/utils' // Added cn import
import { BlogPost, BlogTag } from '@/types/blocks'
import { Locale } from '@/constants'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { EnhancedBlogSkeleton } from '@/components/blog/EnhancedBlogSkeleton'

import { Pagination } from '@/components/Pagination'
import { NewsletterWrapper } from '@/components/blog/NewsletterWrapper'
import { X, Search, GridIcon, ListIcon, Sparkles, TrendingUp, FolderOpen, Tag } from 'lucide-react' // Added GridIcon, ListIcon
import { Button } from '@/components/ui/button'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import Link from 'next/link' // Although client component, Link is still useful for navigation

// Simple error boundary for translation errors
class BlogErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Blog page error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Define the props for the client component
interface BlogPageProps {
  initialPosts: PaginatedDocs<BlogPost>
  categories: BlogTag[] // Assuming categories and tags have a similar structure
  tags: BlogTag[]
  locale: Locale
  translations: {
    title: string
    description: string
    searchPlaceholder: string
    noPostsFound: string
    loadMore: string
    categories: string
    tags: string
    allCategories: string
    allTags: string
  }
}

const BlogPageClient: React.FC<BlogPageProps> = ({
  initialPosts,
  categories,
  tags,
  locale,
  translations,
}) => {
  // Initialize translations hook
  const t = useTranslations('blogPage')

  // State for managing posts, pagination, filters, and search
  const [posts, setPosts] = useState(initialPosts)
  const [currentPage, setCurrentPage] = useState(initialPosts.page || 1)
  const [currentCategory, setCurrentCategory] = useState<string | undefined>(undefined)
  const [currentTag, setCurrentTag] = useState<string | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid') // Add layout state
  const [showAllCategories, setShowAllCategories] = useState(false) // State for expanding categories
  const [showAllTags, setShowAllTags] = useState(false) // State for expanding tags

  // Remove debouncing for immediate search response
  // const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Function to fetch posts from the API route
  const fetchPosts = useCallback(
    async (
      page: number,
      category?: string,
      tag?: string,
      search?: string,
      signal?: AbortSignal,
    ) => {
      // Abort any previous request when parameters change
      if (signal?.aborted) return
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', page.toString())

        // Find category ID from slug if a category filter is active
        const categoryObj = category ? categories.find((cat) => cat.slug === category) : undefined
        if (categoryObj) params.set('categories', categoryObj.id) // Use ID for the API query

        // Find tag ID from slug if a tag filter is active
        const tagObj = tag ? tags.find((t) => t.slug === tag) : undefined
        if (tagObj) params.set('tags', tagObj.id) // Use ID for the API query

        // Add search query with improved handling
        if (search && search.trim().length >= 2) {
          params.set('search', search.trim())
        }

        params.set('locale', locale)
        params.set('limit', '9') // Set consistent limit
        params.set('sort', '-publishedAt') // Sort by newest first

        logDebug('Fetching posts with params:', params.toString())

        const response = await fetch(`/api/v1/blog/posts?${params.toString()}`, {
          signal,
          headers: {
            'Content-Type': 'application/json',
          },
          // Add cache control for better performance
          cache: 'no-store', // Ensure fresh data for search results
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to fetch posts: ${response.status} ${errorText}`)
        }

        const data: PaginatedDocs<BlogPost> = await response.json()

        // Validate response data
        if (!data || !Array.isArray(data.docs)) {
          throw new Error('Invalid response format from API')
        }

        setPosts(data)
        setCurrentPage(page)

        logDebug(`Fetched ${data.docs.length} posts, total: ${data.totalDocs}`)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          logError('Error fetching posts:', error)
          // Set empty results on error to show "no posts found" message
          setPosts({
            docs: [],
            totalDocs: 0,
            totalPages: 0,
            page: 1,
            limit: 9,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null,
          })
        }
      } finally {
        setLoading(false)
      }
    },
    [locale, categories, tags],
  ) // Include categories and tags as dependencies

  // Handle category filter change
  const handleCategoryChange = (categorySlug: string | undefined) => {
    setCurrentCategory(categorySlug)
    setCurrentPage(1) // Reset to first page on filter change
  }

  // Handle tag filter change
  const handleTagChange = (tagSlug: string | undefined) => {
    setCurrentTag(tagSlug)
    setCurrentPage(1) // Reset to first page on filter change
  }

  // Handle search input change
  const handleSearchChange = useCallback((searchQuery: string | undefined) => {
    logDebug('handleSearchChange called with:', searchQuery)
    setSearchTerm(searchQuery)
    setCurrentPage(1) // Reset to first page on search change
  }, []) // No dependencies needed as it only updates state

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle clearing all filters
  const handleClearAllFilters = useCallback(() => {
    setCurrentCategory(undefined)
    setCurrentTag(undefined)
    setSearchTerm(undefined)
    setCurrentPage(1)
  }, [])

  // Ref to track initial mount
  const isInitialMount = useRef(true)

  // Ref for AbortController
  const abortControllerRef = useRef<AbortController | null>(null)

  // Effect to handle initial search params from the URL on client load
  // This is needed if the user navigates directly to a filtered/paginated URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const page = parseInt(params.get('page') || '1', 10)
      const category = params.get('category') || undefined
      const tag = params.get('tag') || undefined
      const search = params.get('search') || undefined

      // Update state based on URL params
      setCurrentPage(page)
      setCurrentCategory(category)
      setCurrentTag(tag)
      setSearchTerm(search)
    }

    // Mark initial mount as complete after state is set
    isInitialMount.current = false
  }, [locale]) // Depend only on locale, as initialPosts is static

  // Effect to send blog view analytics event on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      // TODO: Replace with actual analytics event emission code
      logDebug('Analytics: Blog page viewed (initial load)')
      isInitialMount.current = false
    }
  }, []) // Empty dependency array ensures this runs only on mount

  // Effect to update URL based on state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams()
      if (currentPage > 1) params.set('page', currentPage.toString())
      if (currentCategory) params.set('category', currentCategory)
      if (currentTag) params.set('tag', currentTag)
      if (searchTerm) params.set('search', searchTerm)

      const newUrl = `/${locale}/blog${params.toString() ? `?${params.toString()}` : ''}`
      window.history.pushState({}, '', newUrl)
    }
  }, [currentPage, currentCategory, currentTag, searchTerm, locale])

  // Debounced effect to fetch posts when filters, search, or page change
  useEffect(() => {
    // Prevent fetching on initial mount if state hasn't been set from URL yet
    if (isInitialMount.current && typeof window !== 'undefined') {
      // Check if URL params have been processed. If not, wait.
      // This simple check assumes URL params are processed quickly.
      // A more robust solution might involve another state variable.
      const params = new URLSearchParams(window.location.search)
      if (
        params.get('page') ||
        params.get('category') ||
        params.get('tag') ||
        params.get('search')
      ) {
        // If params exist, allow fetch, otherwise wait for the initial param processing effect
      } else {
        return
      }
    }

    // Re-added type assertion for debounce result
    const debouncedFetch = debounce(
      async (page: number, category?: string, tag?: string, search?: string) => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort() // Abort previous debounced request
        }
        const controller = new AbortController()
        abortControllerRef.current = controller

        // setLoading(true); // Set loading before fetch starts (moved inside fetchPosts)

        try {
          // Pass the signal to fetchPosts
          await fetchPosts(page, category, tag, search, controller.signal)
        } catch (error: any) {
          // Error handling is now primarily within fetchPosts
          if (error.name !== 'AbortError') {
            logError('Debounced fetch error (should be handled in fetchPosts):', error)
          }
        } finally {
          // Clear the ref if this controller is still the active one
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null
          }
          // setLoading(false); // Loading is set to false inside fetchPosts
        }
      },
      300,
    ) as typeof fetchPosts & { cancel: () => void } // Re-added type assertion

    // Trigger the debounced fetch
    debouncedFetch(currentPage, currentCategory, currentTag, searchTerm)

    // Cleanup function: cancel the debounced call and abort the fetch if it's running
    return () => {
      debouncedFetch.cancel()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null // Clear ref on cleanup
      }
    }
    // Dependencies: Fetch when page, filters, search term, or locale changes
  }, [currentPage, currentCategory, currentTag, searchTerm, locale, fetchPosts])

  // Find active category details if we have a category filter
  const activeCategory = currentCategory
    ? categories.find((cat) => cat.slug === currentCategory)
    : undefined

  // Determine if there are active filters
  const hasActiveFilters = !!(currentCategory || currentTag || searchTerm)

  // URL for clearing all filters
  const clearAllFiltersUrl = `/${locale}/blog`

  return (
    <BlogErrorBoundary
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
            <p className="text-muted-foreground">Please refresh the page to try again.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-background">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="relative mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                {translations.title}
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl xl:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {translations.title}
              </h1>
              <p className="mx-auto max-w-2xl text-lg lg:text-xl text-muted-foreground leading-relaxed">
                {translations.description}
              </p>

              {/* Stats */}
              <div className="mt-12 flex flex-wrap justify-center gap-8 lg:gap-12">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">
                    {posts.totalDocs}
                  </div>
                  <div className="text-sm text-muted-foreground">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">
                    {categories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">{translations.categories}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">{tags.length}</div>
                  <div className="text-sm text-muted-foreground">{translations.tags}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Main content */}
          <div className="lg:flex lg:gap-8">
            {/* Main column with articles */}
            <div className="blog-fade-in visible lg:w-2/3">
              {/* Tools panel with filters and search */}
              {/* Tools panel: Search and Layout Toggle */}
              {/* Row 1: Search, Layout Toggle, and Active Filters */}
              {/* Parent Container for Controls */}
              <div className="mb-8 flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                {' '}
                {/* Changed to flex-col, kept other styles */}
                {/* Row 1: Search and Layout Toggle */}
                <div className="flex flex-row items-center justify-between gap-4">
                  {' '}
                  {/* New row div */}
                  {/* Search Input */}
                  <div className="flex-1">
                    <BlogSearch
                      placeholder={translations.searchPlaceholder}
                      onSearch={handleSearchChange} // Use client-side handler
                      initialQuery={searchTerm} // Pass initial search term
                      variant="default"
                      size="default"
                      className="w-full"
                      showClearButton={true}
                    />
                  </div>
                  {/* Layout Switcher Buttons */}
                  <div className="flex-none flex h-10 bg-background/80 backdrop-blur-sm rounded-lg relative border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setLayout('grid')}
                      aria-label="Grid Layout"
                      aria-pressed={layout === 'grid'}
                      className={cn(
                        'relative z-20',
                        'h-10 px-3',
                        'flex items-center justify-center',
                        'transition-all duration-200',
                        'border-r border-border/30', // Separator for grid button
                        layout === 'grid'
                          ? 'bg-accent text-accent-foreground font-medium' // Active state
                          : 'hover:bg-accent/20', // Inactive hover state
                      )}
                    >
                      <GridIcon className="h-4 w-4 mr-1.5" />
                      <span className="text-xs sm:text-sm">{t('viewToggleGrid')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayout('list')}
                      aria-label="List Layout"
                      aria-pressed={layout === 'list'}
                      className={cn(
                        'relative z-20',
                        'h-10 px-3',
                        'flex items-center justify-center',
                        'transition-all duration-200',
                        layout === 'list'
                          ? 'bg-accent text-accent-foreground font-medium' // Active state
                          : 'hover:bg-accent/20', // Inactive hover state
                      )}
                    >
                      <ListIcon className="h-4 w-4 mr-1.5" />
                      <span className="text-xs sm:text-sm">{t('viewToggleList')}</span>
                    </button>
                  </div>
                </div>{' '}
                {/* End of Row 1 */}
                {/* Row 2: Active Filters (conditionally rendered, moved outside row 1) */}
                {hasActiveFilters && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {' '}
                    {/* Added mt-4 for spacing */}
                    <span className="text-sm text-muted-foreground">{t('activeFilters')}:</span>
                    <div className="flex flex-wrap gap-2">
                      {currentCategory && activeCategory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCategoryChange(undefined)}
                          className="blog-tag inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                        >
                          {activeCategory.title}
                          <X className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      {currentTag && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTagChange(undefined)}
                          className="blog-tag inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                        >
                          {tags.find((tag) => tag.slug === currentTag)?.title || currentTag}
                          <X className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSearchChange(undefined)}
                          className="blog-tag inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                        >
                          {searchTerm}
                          <X className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllFilters}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t('clearFilters')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Featured Post Section */}
              {!hasActiveFilters && posts.docs.length > 0 && (
                <div className="mb-16">
                  <div className="mb-8 flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">{t('featuredArticle')}</h2>
                  </div>
                  <FeaturedPost post={posts.docs[0]} locale={locale} className="mb-8" />
                </div>
              )}

              {/* Articles section - Enhanced loading with smooth transitions */}
              <div
                className={cn(
                  'transition-all duration-500 ease-in-out', // Enhanced transition
                  loading && 'opacity-60 scale-[0.98]', // Subtle scale effect when loading
                )}
              >
                {loading ? (
                  <div className="animate-in fade-in duration-500">
                    <EnhancedBlogSkeleton
                      layout={layout}
                      count={6}
                      showFeatured={false}
                      showProgress={false}
                    />
                  </div>
                ) : posts.docs.length > 0 ? (
                  <div className="space-y-8">
                    {/* Section title */}
                    <div className="blog-smooth-entrance" style={{ animationDelay: '0.1s' }}>
                      <h2 className="text-2xl font-bold">
                        {hasActiveFilters ? t('searchResults') : t('latestArticles')}
                      </h2>
                    </div>

                    {/* Apply grid or list classes based on layout state */}
                    <div
                      className={cn(
                        'gap-6', // Убираем конфликтующие анимации
                        layout === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col',
                      )}
                    >
                      {posts.docs.map((post, index) => {
                        // Skip featured post if it's the first one and no filters are active
                        if (!hasActiveFilters && index === 0) return null

                        // Add a check to ensure the post object is valid before rendering
                        if (!post || !post.id) {
                          logWarn('Skipping rendering for invalid post object:', post)
                          return null // Skip rendering if post is null, undefined, or missing an id
                        }
                        return (
                          <BlogPostCard
                            key={post.id} // Use post ID as key
                            post={post}
                            locale={locale}
                            layout={layout} // Pass the layout state
                            imagePriority={index < 3} // Prioritize loading images for first few cards
                            className="blog-smooth-entrance transition-all duration-300 hover:scale-[1.01]" // Плавная анимация
                            style={{
                              animationDelay: `${(index - (hasActiveFilters ? 0 : 1)) * 0.08}s`, // Уменьшенная задержка для плавности
                            }}
                          />
                        )
                      })}
                    </div>

                    {/* Pagination */}
                    {posts.totalPages > 1 && (
                      <div
                        className="mt-12 flex justify-center blog-smooth-entrance"
                        style={{ animationDelay: '0.5s' }}
                      >
                        <Pagination
                          page={currentPage}
                          totalPages={posts.totalPages}
                          onPageChange={handlePageChange} // Use client-side handler
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // "No results found" message - Only show if NOT loading and no posts
                  !loading && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/20 py-16 text-center">
                      <div className="h-16 w-16 rounded-full bg-muted/50 p-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mt-4 text-xl font-medium">{t('noPostsFound')}</h3>
                      <p className="mt-2 max-w-md text-muted-foreground">
                        {t('tryChangingFilters')}
                      </p>
                      <Button className="mt-4" onClick={handleClearAllFilters}>
                        {t('clearFilters')}
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div
              className="blog-smooth-entrance mt-12 lg:mt-0 lg:w-1/3 space-y-8"
              style={{ animationDelay: '0.3s' }}
            >
              {/* Categories */}
              {categories.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 transition-colors duration-300 hover:bg-primary/20">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{t('categories')}</h3>
                  </div>
                  <BlogTagCloud
                    tags={categories}
                    activeTag={currentCategory}
                    type="categories"
                    showCount
                    limit={showAllCategories ? undefined : 10} // Show 10 categories by default, all when expanded
                    onTagClick={handleCategoryChange} // Use client-side handler
                    onShowAll={() => setShowAllCategories(true)} // Handler for expanding categories
                    // preserveParams is no longer needed
                  />
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 transition-colors duration-300 hover:bg-primary/20">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{t('tags')}</h3>
                  </div>
                  <BlogTagCloud
                    tags={tags}
                    activeTag={currentTag}
                    type="tags"
                    showCount
                    sizeFactor
                    limit={showAllTags ? undefined : 20} // Show 20 tags by default, all when expanded
                    onTagClick={handleTagChange} // Use client-side handler
                    onShowAll={() => setShowAllTags(true)} // Handler for expanding tags
                    // preserveParams is no longer needed
                  />
                </div>
              )}

              {/* Newsletter - контейнер скрывается если пользователь уже подписан */}
              <NewsletterWrapper locale={locale} storageKey="blog_newsletter_subscription" />
            </div>
          </div>
        </div>
      </div>
    </BlogErrorBoundary>
  )
}

export default BlogPageClient
