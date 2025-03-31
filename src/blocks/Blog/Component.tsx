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

export function BlogBlock({
  layout = 'grid',
  postsPerPage = 9,
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
  const currentPage = searchParams.get('page')
    ? parseInt(searchParams.get('page') as string, 10)
    : 1
  const searchQuery = searchParams.get('search') || ''
  const categorySlug = searchParams.get('category') || ''
  const tagSlug = searchParams.get('tag') || ''

  // Use Payload API to fetch data
  const { fetchPosts, fetchCategories, fetchTags } = usePayloadAPI()

  // Memoize fetch functions to avoid recreating them on each render
  const fetchPostsData = useCallback(async () => {
    if (fetchInProgress.current) return
    fetchInProgress.current = true
    setLoading(true)

    try {
      console.log('BlogBlock: Fetching posts')
      const response = await fetchPosts({
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
    } catch (err) {
      console.error('BlogBlock: Error fetching posts:', err)
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
    fetchPosts,
  ])

  const fetchCategoriesData = useCallback(async () => {
    if (!showCategories || fetchInProgress.current || initialCategories) return

    try {
      console.log('BlogBlock: Fetching categories')
      const categoriesData = await fetchCategories({ locale: currentLocale || DEFAULT_LOCALE })
      setCategories(categoriesData)
    } catch (err) {
      console.error('BlogBlock: Error fetching categories:', err)
      setApiErrorOccurred(true)
    }
  }, [currentLocale, fetchCategories, initialCategories, showCategories])

  const fetchTagsData = useCallback(async () => {
    if (!showTags || fetchInProgress.current || initialTags) return

    try {
      console.log('BlogBlock: Fetching tags')
      const tagsData = await fetchTags({ locale: currentLocale || DEFAULT_LOCALE })
      setTags(tagsData)
    } catch (err) {
      console.error('BlogBlock: Error fetching tags:', err)
      setApiErrorOccurred(true)
    }
  }, [currentLocale, fetchTags, initialTags, showTags])

  // Effect for search params change detection
  useEffect(() => {
    const currentSearchParams = searchParams.toString()

    // Only refetch if search params have changed and it's not the initial render
    if (prevSearchParamsRef.current !== currentSearchParams && initialDataProcessed.current) {
      console.log('BlogBlock: Search params changed, refetching data')
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

  return (
    <div className="container mx-auto px-4 py-8">
      {apiErrorOccurred && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
          <p>
            <strong>Note:</strong> We're currently experiencing some technical issues with our blog
            API. Some features might be limited. Our team is working to resolve this as soon as
            possible.
          </p>
        </div>
      )}

      {(title || description) && (
        <PageHeading
          title={title || (currentLocale === 'ru' ? 'Блог' : 'Blog')}
          description={description}
          center
          className="mb-8"
        />
      )}

      {showSearch && !apiErrorOccurred && (
        <div className="mb-8 max-w-md mx-auto">
          <BlogSearch onSearch={handleSearch} initialQuery={searchQuery} />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
        {showCategories && categories.length > 0 && (
          <div className="md:w-1/2">
            <h3 className="text-lg font-medium mb-2">Categories</h3>
            <BlogTagCloud tags={categories} type="categories" showCount sizeFactor />
          </div>
        )}

        {showTags && tags.length > 0 && (
          <div className="md:w-1/2">
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <BlogTagCloud tags={tags} type="tags" showCount sizeFactor limit={20} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {showFeaturedPost && posts.length > 0 && (
            <div className="mb-12">
              <BlogPostCard post={posts[0]} variant="featured" />
            </div>
          )}

          {posts.length > 0 ? (
            <div
              className={`grid ${
                layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              } gap-6`}
            >
              {posts.slice(showFeaturedPost ? 1 : 0).map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  variant={layout === 'grid' ? 'default' : 'minimal'}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No posts found. Try adjusting your search or filters.
            </div>
          )}

          {showPagination && !apiErrorOccurred && totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', page.toString())
                  router.push(`${pathname}?${params.toString()}`)
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
