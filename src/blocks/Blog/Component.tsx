'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'
import { Pagination } from '@/components/Pagination'
import { PageHeading } from '@/components/PageHeading'
import { usePayloadAPI } from '@/providers/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { GridContainer } from '@/components/GridContainer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Grid2X2, List, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useBlog } from '@/providers/BlogProvider'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  heroImage?: {
    url: string
    alt: string
  }
  author?: {
    name: string
    avatar?: string
  }
  categories?: {
    id: string
    title: string
    slug: string
  }[]
  readTime?: number
}

interface Category {
  id: string
  title: string
  slug: string
  count?: number
}

interface Tag {
  id: string
  title: string
  slug: string
  count?: number
}

interface BlogBlockProps {
  layout?: 'grid' | 'list'
  postsPerPage?: number
  showFeaturedPost?: boolean
  showSearch?: boolean
  showCategories?: boolean
  showTags?: boolean
  showPagination?: boolean
  categoryID?: string
  tagID?: string
  authorID?: string
  initialPosts?: Post[]
  initialCategories?: Category[]
  initialTags?: Tag[]
  title?: string
  description?: string
  settings?: any
}

// Fallback data in case API fails
const FALLBACK_POSTS: Post[] = [
  {
    id: 'fallback-1',
    title: 'Sample Blog Post',
    slug: '#',
    excerpt: 'This is a sample blog post that appears when the API is unavailable.',
    publishedAt: new Date().toISOString(),
  },
]

const variants = {
  grid: {
    container: 'grid gap-8',
    cols: {
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
    },
    item: 'flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-200',
  },
  list: {
    container: 'space-y-8',
    item: 'flex flex-col md:flex-row gap-8 bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-200',
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function Blog({
  layout = 'grid',
  postsPerPage = 6,
  showFeaturedPost = true,
  showSearch = true,
  showCategories = true,
  showTags = true,
  showPagination = true,
  categoryID,
  tagID,
  authorID,
  initialPosts,
  initialCategories,
  initialTags,
  title,
  description,
  settings,
}: BlogBlockProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const prevSearchParamsRef = useRef<string>(searchParams.toString())

  const [posts, setPosts] = useState<Post[]>(initialPosts || [])
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [tags, setTags] = useState<Tag[]>(initialTags || [])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(
    initialPosts ? Math.ceil(initialPosts.length / postsPerPage) : 1,
  )
  const [error, setError] = useState<string | null>(null)
  const [apiErrorOccurred, setApiErrorOccurred] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Track if we need to fetch data from API
  const shouldFetchFromAPI = useRef<boolean>(!initialPosts || !initialCategories || !initialTags)
  // Track if initial data is already processed
  const initialDataProcessed = useRef<boolean>(false)
  // Track if a fetch is currently in progress
  const fetchInProgress = useRef<boolean>(false)

  // Get the current locale from the pathname
  const segments = pathname.split('/')
  const currentLocale = (segments.length > 1 ? segments[1] : 'en') as Locale

  // Get current page from query params
  const currentPageFromParams = searchParams.get('page')
    ? parseInt(searchParams.get('page') as string, 10)
    : 1
  const searchQueryFromParams = searchParams.get('search') || ''
  const categorySlug = searchParams.get('category') || ''
  const tagSlug = searchParams.get('tag') || ''

  // Use Payload API to fetch data
  const { fetchPosts: fetchPayloadPosts, fetchCategories, fetchTags } = usePayloadAPI()

  // Use BlogProvider for blog-related functionality
  const {
    posts: blogPosts,
    isLoading: blogLoading,
    error: blogError,
    fetchPosts: fetchBlogPosts,
    setSearchQuery: setBlogSearchQuery,
  } = useBlog()

  // Memoize fetch functions to avoid recreating them on each render
  const fetchPostsData = useCallback(async () => {
    if (fetchInProgress.current) return
    fetchInProgress.current = true
    setLoading(true)

    try {
      logDebug('BlogBlock: Fetching posts')

      // Use BlogProvider if available, otherwise fallback to direct API call
      if (fetchBlogPosts) {
        await fetchBlogPosts({
          page: currentPage,
          limit: postsPerPage,
          categorySlug: categorySlug || (categoryID ? categoryID : ''),
          tagSlug: tagSlug || (tagID ? tagID : ''),
          authorId: authorID || '',
          locale: currentLocale || DEFAULT_LOCALE,
        })

        // Update local state from BlogProvider
        if (blogPosts) {
          setPosts(blogPosts)
          setTotalPages(Math.ceil(blogPosts.length / postsPerPage))
        }
      } else {
        // Fallback to direct API call
        const response = await fetchPayloadPosts({
          locale: currentLocale || DEFAULT_LOCALE,
          page: currentPage,
          limit: postsPerPage,
          searchQuery,
          categorySlug: categorySlug || (categoryID ? categoryID : ''),
          tagSlug: tagSlug || (tagID ? tagID : ''),
          authorId: authorID || '',
        })

        setPosts(response.docs)
        setTotalPages(Math.ceil(response.totalDocs / postsPerPage))
      }
    } catch (err) {
      logError('BlogBlock: Error fetching posts:', err)
      setError('An error occurred while fetching posts. Showing sample content instead.')
      setPosts(FALLBACK_POSTS)
      setApiErrorOccurred(true)
    } finally {
      setLoading(false)
      fetchInProgress.current = false
    }
  }, [
    currentLocale,
    currentPage,
    postsPerPage,
    searchQuery,
    categorySlug,
    tagSlug,
    categoryID,
    tagID,
    authorID,
    fetchPayloadPosts,
    fetchBlogPosts,
    blogPosts,
  ])

  const fetchCategoriesData = useCallback(async () => {
    if (!showCategories || fetchInProgress.current || initialCategories) return

    try {
      logDebug('BlogBlock: Fetching categories')
      const categoriesData = await fetchCategories({ locale: currentLocale || DEFAULT_LOCALE })
      setCategories(categoriesData)
    } catch (err) {
      logError('BlogBlock: Error fetching categories:', err)
      setApiErrorOccurred(true)
    }
  }, [currentLocale, fetchCategories, initialCategories, showCategories])

  const fetchTagsData = useCallback(async () => {
    if (!showTags || fetchInProgress.current || initialTags) return

    try {
      logDebug('BlogBlock: Fetching tags')
      const tagsData = await fetchTags({ locale: currentLocale || DEFAULT_LOCALE })
      setTags(tagsData)
    } catch (err) {
      logError('BlogBlock: Error fetching tags:', err)
      setApiErrorOccurred(true)
    }
  }, [currentLocale, fetchTags, initialTags, showTags])

  // Effect for search params change detection
  useEffect(() => {
    const currentSearchParams = searchParams.toString()

    // Only refetch if search params have changed and it's not the initial render
    if (prevSearchParamsRef.current !== currentSearchParams && initialDataProcessed.current) {
      logDebug('BlogBlock: Search params changed, refetching data')
      fetchPostsData()
    }

    prevSearchParamsRef.current = currentSearchParams
  }, [searchParams, fetchPostsData])

  // Handle initial data loading or API fetching
  useEffect(() => {
    // Skip if we've already processed initial data
    if (initialDataProcessed.current) return

    // If we have initial data from the server, mark as processed
    if (initialPosts) {
      initialDataProcessed.current = true

      // Only fetch categories or tags if we don't have them
      if (!initialCategories && showCategories) {
        fetchCategoriesData()
      }

      if (!initialTags && showTags) {
        fetchTagsData()
      }

      return
    }

    // Otherwise, fetch everything from the API
    if (shouldFetchFromAPI.current) {
      fetchPostsData()
      fetchCategoriesData()
      fetchTagsData()
      initialDataProcessed.current = true
    }
  }, [
    initialPosts,
    initialCategories,
    initialTags,
    showCategories,
    showTags,
    fetchPostsData,
    fetchCategoriesData,
    fetchTagsData,
  ])

  // Handle search
  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page on new search

    router.push(`${pathname}?${params.toString()}`)
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      !selectedCategory || post.categories?.some((cat) => cat.id === selectedCategory)
    return matchesSearch && matchesCategory
  })

  const totalPagesFromFiltered = Math.ceil(filteredPosts.length / postsPerPage)
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  )

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
      setCurrentPage(1)
    },
    [selectedCategory],
  )

  const renderPost = (post) => (
    <motion.article
      key={post.id}
      className={viewMode === 'grid' ? variants.grid.item : variants.list.item}
      variants={itemVariants}
    >
      {post.heroImage && (
        <div
          className={cn(
            'relative',
            viewMode === 'grid' ? 'aspect-video' : 'md:w-1/3 aspect-video md:aspect-auto',
          )}
        >
          <Media
            resource={post.heroImage}
            className="object-cover"
            fill
            sizes={
              viewMode === 'grid'
                ? '(max-width: 768px) 100vw, 33vw'
                : '(max-width: 768px) 100vw, 50vw'
            }
          />
        </div>
      )}

      <div className="flex-1 p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
          {post.excerpt && <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {post.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
          )}
          {post.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} {settings?.locale === 'ru' ? 'мин чтения' : 'min read'}
            </div>
          )}
        </div>

        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80',
                )}
              >
                {category.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )

  return (
    <GridContainer settings={settings}>
      <div className="space-y-12">
        {(title || description) && (
          <motion.div
            className="text-center max-w-3xl mx-auto space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title && <h2 className="text-3xl font-bold tracking-tight">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </motion.div>
        )}

        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {showSearch && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    // Also update search query in BlogProvider
                    if (setBlogSearchQuery) {
                      setBlogSearchQuery(value)
                    }
                    setCurrentPage(1)
                  }}
                  className="pl-9"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showCategories && initialCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {initialCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                    'px-4 py-2 rounded-full',
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80',
                  )}
                >
                  {category.title}
                  {category.count && <span className="ml-2 text-xs">{category.count}</span>}
                </button>
              ))}
            </div>
          )}

          <div
            className={cn(
              viewMode === 'grid' ? variants.grid.container : variants.list.container,
              viewMode === 'grid' && variants.grid.cols[2],
            )}
          >
            <AnimatePresence mode="wait">{currentPosts.map(renderPost)}</AnimatePresence>
          </div>

          {totalPagesFromFiltered > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPagesFromFiltered }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPagesFromFiltered}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </GridContainer>
  )
}

export const BlogBlock = Blog
export default Blog
