'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import debounce from 'lodash.debounce'
import { PaginatedDocs } from 'payload'
import { BlogPost, BlogTag } from '@/types/blocks'
import { Locale } from '@/constants'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { Pagination } from '@/components/Pagination'
import { NewsletterWrapper } from '@/components/blog/NewsletterWrapper'
import { X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link' // Although client component, Link is still useful for navigation

// Define the props for the client component
interface BlogPageProps {
  initialPosts: PaginatedDocs<BlogPost>
  categories: BlogTag[] // Assuming categories and tags have a similar structure
  tags: BlogTag[]
  locale: Locale
  texts: {
    title: string
    description: string
    posts: string
    categories: string
    tags: string
    noPostsFound: string
    tryChangingFilters: string
    filters: string
    clearFilters: string
    searchPlaceholder: string
    activeFilters: string
    all: string
  }
}

const BlogPageClient: React.FC<BlogPageProps> = ({
  initialPosts,
  categories,
  tags,
  locale,
  texts: t,
}) => {
  // State for managing posts, pagination, filters, and search
  const [posts, setPosts] = useState(initialPosts)
  const [currentPage, setCurrentPage] = useState(initialPosts.page || 1)
  const [currentCategory, setCurrentCategory] = useState<string | undefined>(undefined)
  const [currentTag, setCurrentTag] = useState<string | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  // Function to fetch posts from the API route
  const fetchPosts = useCallback(async (page: number, category?: string, tag?: string, search?: string, signal?: AbortSignal) => {
    // Abort any previous request when parameters change
    if (signal?.aborted) return;
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (category) params.set('categories', category)
      if (tag) params.set('tags', tag)
      if (search) params.set('search', search)
      params.set('locale', locale)
      // Exclude draft posts
      params.set('where[_status][not_equals]', 'draft')

      const response = await fetch(`/api/v1/posts?${params.toString()}`, { signal })
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data: PaginatedDocs<BlogPost> = await response.json()
      setPosts(data)
      setCurrentPage(page)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching posts:', error)
        // Optionally show an error message to the user
      }
    } finally {
      setLoading(false)
    }
  }, [locale]); // Only locale is needed as a dependency

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
    setSearchTerm(searchQuery);
    setCurrentPage(1); // Reset to first page on search change
  }, []); // No dependencies needed as it only updates state

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Ref to track initial mount
  const isInitialMount = useRef(true);

  // Ref for AbortController
  const abortControllerRef = useRef<AbortController | null>(null);


  // Effect to handle initial search params from the URL on client load
  // This is needed if the user navigates directly to a filtered/paginated URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || '1', 10);
    const category = params.get('category') || undefined;
    const tag = params.get('tag') || undefined;
    const search = params.get('search') || undefined;

    // Update state based on URL params
    setCurrentPage(page);
    setCurrentCategory(category);
    setCurrentTag(tag);
    setSearchTerm(search);

    // Mark initial mount as complete after state is set
    isInitialMount.current = false;

  }, [locale]); // Depend only on locale, as initialPosts is static

  // Effect to send blog view analytics event on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      // TODO: Replace with actual analytics event emission code
      console.log('Analytics: Blog page viewed (initial load)');
      isInitialMount.current = false;
    }
  }, []); // Empty dependency array ensures this runs only on mount

  // Effect to fetch posts when state changes (filters, pagination, or search becomes empty)
  useEffect(() => {
    // Prevent fetching on initial mount
    if (isInitialMount.current) {
      return;
    }

    // Create a new AbortController for this immediate fetch
    const controller = new AbortController();

    // Only fetch immediately if searchTerm is empty or state changes other than searchTerm
    // If searchTerm is not empty, the debounced function handles the fetch
    if (!searchTerm) {
       fetchPosts(currentPage, currentCategory, currentTag, searchTerm, controller.signal);
    }

    return () => {
      // Abort the request initiated by this effect
      controller.abort();
    };
  }, [currentPage, currentCategory, currentTag, searchTerm, locale, fetchPosts]); // Dependencies

  // Effect to update URL based on state changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (currentPage > 1) params.set('page', currentPage.toString())
    if (currentCategory) params.set('category', currentCategory)
    if (currentTag) params.set('tag', currentTag)
    if (searchTerm) params.set('search', searchTerm)

    const newUrl = `/${locale}/blog${params.toString() ? `?${params.toString()}` : ''}`
    window.history.pushState({}, '', newUrl)
  }, [currentPage, currentCategory, currentTag, searchTerm, locale])

  // Effect to debounce fetchPosts when searchTerm, currentPage, currentCategory, or currentTag changes
  useEffect(() => {
    const debouncedFetch = debounce(async (page: number, category?: string, tag?: string, search?: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await fetchPosts(page, category, tag, search, controller.signal);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching posts:', error);
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    }, 300) as  typeof fetchPosts & { cancel: () => void }; // Debounce for 300ms and cast to include cancel method

    // Initial fetch on mount or when dependencies change
    if (!isInitialMount.current) {
      debouncedFetch(currentPage, currentCategory, currentTag, searchTerm);
    }


    // Cleanup: cancel the debounced function and abort any pending request
    return () => {
      debouncedFetch.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [searchTerm, currentPage, currentCategory, currentTag, fetchPosts]); // Dependencies for the effect


  // Find active category details if we have a category filter
  const activeCategory = currentCategory
    ? categories.find((cat) => cat.slug === currentCategory)
    : undefined

  // Determine if there are active filters
  const hasActiveFilters = !!(currentCategory || currentTag || searchTerm)

  // URL for clearing all filters
  const clearAllFiltersUrl = `/${locale}/blog`

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero section with title and description */}
        <div className="relative mx-auto mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">{t.title}</h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">{t.description}</p>
        </div>

        {/* Main content */}
        <div className="lg:flex lg:gap-8">
          {/* Main column with articles */}
          <div className="blog-fade-in visible lg:w-2/3">
            {/* Tools panel with filters and search */}
            <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex-1">
                <BlogSearch
                  placeholder={t.searchPlaceholder}
                  onSearch={handleSearchChange} // Use client-side handler
                  initialQuery={searchTerm} // Pass initial search term
                  variant="default"
                  size="default"
                  className="w-full"
                  showClearButton={true}
                />
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">{t.activeFilters}:</span>
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
                    onClick={() => {
                      handleCategoryChange(undefined)
                      handleTagChange(undefined)
                      handleSearchChange(undefined)
                    }}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t.clearFilters}
                  </Button>
                </div>
              )}
            </div>

            {/* Articles section */}
            {loading ? (
              <div>Loading...</div> // Basic loading indicator
            ) : posts.docs.length > 0 ? (
              <div className="blog-fade-in visible space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  {posts.docs.map((post, index) => {
                    // Add a check to ensure the post object is valid before rendering
                    if (!post || !post.id) {
                      console.warn('Skipping rendering for invalid post object:', post);
                      return null; // Skip rendering if post is null, undefined, or missing an id
                    }
                    return (
                      <BlogPostCard
                        key={post.id}
                        post={post}
                        locale={locale}
                        layout="grid"
                        imagePriority={index < 2}
                        className="blog-fade-in visible"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {posts.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      page={currentPage}
                      totalPages={posts.totalPages}
                      onPageChange={handlePageChange} // Use client-side handler
                      // baseUrl and searchParams are no longer needed for client-side pagination
                    />
                  </div>
                )}
              </div>
            ) : (
              // "No results found" message
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/20 py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted/50 p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-xl font-medium">{t.noPostsFound}</h3>
                <p className="mt-2 max-w-md text-muted-foreground">{t.tryChangingFilters}</p>
                <Button className="mt-4" onClick={() => {
                  handleCategoryChange(undefined)
                  handleTagChange(undefined)
                  handleSearchChange(undefined)
                }}>{t.clearFilters}</Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="blog-fade-in visible mt-12 lg:mt-0 lg:w-1/3">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-8 rounded-xl border border-border p-6 shadow-sm bg-card">
                <h3 className="mb-4 text-lg font-medium">{t.categories}</h3>
                <BlogTagCloud
                  tags={categories}
                  activeTag={currentCategory}
                  type="categories"
                  showCount
                  onTagClick={handleCategoryChange} // Use client-side handler
                  // preserveParams is no longer needed
                />
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-8 rounded-xl border border-border p-6 shadow-sm bg-card">
                <h3 className="mb-4 text-lg font-medium">{t.tags}</h3>
                <BlogTagCloud
                  tags={tags}
                  activeTag={currentTag}
                  type="tags"
                  showCount
                  sizeFactor
                  limit={20}
                  onTagClick={handleTagChange} // Use client-side handler
                  // preserveParams is no longer needed
                />
              </div>
            )}

            {/* Newsletter - rendered on client with subscription check */}
            <NewsletterWrapper locale={locale} storageKey="blog_newsletter_subscription" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPageClient
