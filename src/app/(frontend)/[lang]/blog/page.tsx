import { Metadata } from 'next'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload'
import { getServerSideURL } from '@/utilities/getURL'
import { BlogSearch } from '@/components/blog/BlogSearch'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { Pagination } from '@/components/Pagination'
import { Newsletter } from '@/components/Newsletter'
import { Post, Category, Media } from '@/payload-types'
import { BlogPost, BlogTag } from '@/types/blocks'
import { Filter, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Localized texts
const texts = {
  en: {
    title: 'Blog',
    description: 'Our latest articles and updates',
    posts: 'posts',
    categories: 'Categories',
    tags: 'Tags',
    noPostsFound: 'No posts found',
    tryChangingFilters: 'Try changing your search filters',
    filters: 'Filters',
    clearFilters: 'Clear filters',
    searchPlaceholder: 'Search articles...',
    activeFilters: 'Active filters',
    all: 'All',
  },
  ru: {
    title: 'Блог',
    description: 'Наши последние статьи и обновления',
    posts: 'статей',
    categories: 'Категории',
    tags: 'Теги',
    noPostsFound: 'Статьи не найдены',
    tryChangingFilters: 'Попробуйте изменить параметры поиска',
    filters: 'Фильтры',
    clearFilters: 'Очистить фильтры',
    searchPlaceholder: 'Поиск статей...',
    activeFilters: 'Активные фильтры',
    all: 'Все',
  },
}

// Get properly typed params
type PageParams = {
  params: { lang: string }
  searchParams: {
    page?: string
    category?: string
    tag?: string
    search?: string
  }
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const locale = ((await params).lang || DEFAULT_LOCALE) as Locale
  const t = texts[locale]

  return {
    title: t.title,
    description: t.description,
  }
}

export default async function BlogPage(props: PageParams) {
  try {
    // Destructure props
    const { lang } = await props.params
    const { page, category, tag, search } = await props.searchParams

    const locale = (lang || DEFAULT_LOCALE) as Locale
    const t = texts[locale]
    const currentPage = parseInt(page || '1', 10)
    const limit = 9 // Posts per page

    // Ensure we have a valid server URL for Payload
    // This is critical for resolving the "Failed to fetch" error
    const serverUrl = getServerSideURL()
    console.log(`Using server URL: ${serverUrl}`)

    // Initialize PayloadCMS client with proper error handling
    let payload
    try {
      payload = await getPayloadClient()
    } catch (error) {
      console.error('Failed to initialize PayloadCMS client:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error detected. Check server connectivity and CORS configuration.')
        throw new Error(
          'Database connection error: Cannot connect to Payload API. Please ensure the API server is running.',
        )
      }
      throw new Error('Database connection error. Please try again later.')
    }

    // Build the query conditions
    const query: any = {
      _status: { equals: 'published' },
    }

    // Track if we have any active filters
    const hasActiveFilters = !!(category || tag || search)

    if (category) {
      query['categories.slug'] = { equals: category }
    }

    if (tag) {
      query['tags.slug'] = { equals: tag }
    }

    if (search) {
      query.or = [{ title: { like: search } }]
    }

    // Fetch posts based on filters
    let posts
    try {
      posts = await payload.find({
        collection: 'posts',
        where: query,
        sort: '-publishedAt',
        limit,
        page: currentPage,
        depth: 1, // Load relations 1 level deep
        locale: locale,
      })
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw new Error('Failed to fetch blog posts. Please try again later.')
    }

    // Fetch all categories for filtering
    let categories
    try {
      categories = await payload.find({
        collection: 'categories',
        limit: 100,
        locale: locale,
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Continue with empty categories
      categories = { docs: [] }
    }

    // Format categories
    const formattedCategories = categories.docs.map((cat: any) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug || '',
      count: 0, // We don't have this info
    }))

    // Try to fetch tags (this might not work if tags collection doesn't exist)
    let formattedTags: BlogTag[] = []
    try {
      const tagsResponse = await payload.find({
        collection: 'tags' as any, // Using type assertion as a workaround
        limit: 30,
        locale: locale,
      })

      formattedTags = tagsResponse.docs.map((tagItem: any) => ({
        id: tagItem.id,
        title: tagItem.title || '',
        slug: tagItem.slug || '',
        count: 0,
      }))
    } catch (err) {
      console.error('Error fetching tags:', err)
      // Continue with empty tags array
    }

    // Format data for components
    const formattedPosts: BlogPost[] = posts.docs.map((post: Post) => {
      // Safely handle the hero image
      let heroImage: { url: string; alt: string } | undefined = undefined

      try {
        if (post.heroImage && typeof post.heroImage === 'object') {
          // Type assertion with a check for required properties
          const media = post.heroImage as Record<string, any>

          if (media && media.url) {
            heroImage = {
              url: String(media.url),
              alt: media.alt ? String(media.alt) : post.title,
            }
          }
        }
      } catch (err) {
        console.error('Error processing hero image:', err)
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug || '',
        publishedAt: post.publishedAt || undefined,
        heroImage,
        author:
          post.authors && post.authors.length > 0 && typeof post.authors[0] !== 'string'
            ? {
                id:
                  typeof post.authors[0] === 'object' && post.authors[0]
                    ? post.authors[0].id || ''
                    : '',
                name:
                  typeof post.authors[0] === 'object' && post.authors[0]
                    ? post.authors[0].name || 'Unknown'
                    : 'Unknown',
                avatar: undefined, // We don't have avatar in the Post type
              }
            : undefined,
        categories: post.categories?.map((cat) => {
          if (typeof cat === 'string') return { id: cat, title: '', slug: '' }
          return {
            id: cat.id,
            title: cat.title,
            slug: cat.slug || '',
          }
        }),
        readTime: 5, // Default reading time
      }
    })

    // Find active category details if we have a category filter
    const activeCategory = category
      ? formattedCategories.find((cat) => cat.slug === category)
      : undefined

    // Функция для генерации URL для удаления фильтра
    const getClearFilterUrl = (filterType: string) => {
      const params = new URLSearchParams()

      // Копируем все существующие параметры кроме того, который нужно удалить
      if (category && filterType !== 'category') params.set('category', category)
      if (tag && filterType !== 'tag') params.set('tag', tag)
      if (search) params.set('search', search)

      return `/${locale}/blog${params.toString() ? `?${params.toString()}` : ''}`
    }

    // URL для очистки всех фильтров
    const clearAllFiltersUrl = `/${locale}/blog`

    // URL для пагинации
    const getPageUrl = (pageNum: number) => {
      const params = new URLSearchParams()

      if (category) params.set('category', category)
      if (tag) params.set('tag', tag)
      if (search) params.set('search', search)

      params.set('page', pageNum.toString())

      return `/${locale}/blog?${params.toString()}`
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Hero section с заголовком и описанием */}
          <div className="relative mx-auto mb-12 text-center">
            <div className="mb-2 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              {t.title}
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">{t.title}</h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">{t.description}</p>
          </div>

          {/* Основной контент */}
          <div className="lg:flex lg:gap-8">
            {/* Основная колонка со статьями */}
            <div className="blog-fade-in visible lg:w-2/3">
              {/* Панель инструментов с фильтрами и поиском */}
              <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex-1">
                  <BlogSearch
                    placeholder={t.searchPlaceholder}
                    preserveParams={true}
                    variant="default"
                    size="default"
                    className="w-full"
                  />
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.activeFilters}:</span>
                    <div className="flex flex-wrap gap-2">
                      {category && activeCategory && (
                        <Link
                          href={getClearFilterUrl('category')}
                          className="blog-tag inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                        >
                          {activeCategory.title}
                          <X className="ml-1 h-3 w-3" />
                        </Link>
                      )}
                      {tag && (
                        <Link
                          href={getClearFilterUrl('tag')}
                          className="blog-tag inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                        >
                          {formattedTags.find((t) => t.slug === tag)?.title || tag}
                          <X className="ml-1 h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    <Link
                      href={clearAllFiltersUrl}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t.clearFilters}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Раздел статей */}
              {posts.docs.length > 0 ? (
                <div className="blog-fade-in visible space-y-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {formattedPosts.map((post, index) => (
                      <BlogPostCard
                        key={post.id}
                        post={post}
                        locale={locale}
                        layout="grid"
                        imagePriority={index < 2}
                        className="blog-fade-in visible"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      />
                    ))}
                  </div>

                  {/* Пагинация */}
                  {posts.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination
                        page={currentPage}
                        totalPages={posts.totalPages}
                        baseUrl={`/${locale}/blog`}
                        searchParams={{
                          ...(category ? { category } : {}),
                          ...(tag ? { tag } : {}),
                          ...(search ? { search } : {})
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                // Сообщение "ничего не найдено"
                <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/20 py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted/50 p-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-xl font-medium">{t.noPostsFound}</h3>
                  <p className="mt-2 max-w-md text-muted-foreground">{t.tryChangingFilters}</p>
                  <Link href={clearAllFiltersUrl}>
                    <Button className="mt-4">{t.clearFilters}</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Боковая колонка */}
            <div className="blog-fade-in visible mt-12 lg:mt-0 lg:w-1/3">
              {/* Категории */}
              {formattedCategories.length > 0 && (
                <div className="mb-8 rounded-xl border border-border p-6 shadow-sm bg-card">
                  <h3 className="mb-4 text-lg font-medium">{t.categories}</h3>
                  <BlogTagCloud
                    tags={formattedCategories}
                    activeTag={category}
                    type="categories"
                    showCount
                    preserveParams={true}
                  />
                </div>
              )}

              {/* Теги */}
              {formattedTags.length > 0 && (
                <div className="mb-8 rounded-xl border border-border p-6 shadow-sm bg-card">
                  <h3 className="mb-4 text-lg font-medium">{t.tags}</h3>
                  <BlogTagCloud
                    tags={formattedTags}
                    activeTag={tag}
                    type="tags"
                    showCount
                    sizeFactor
                    limit={20}
                    preserveParams={true}
                  />
                </div>
              )}

              {/* Рассылка */}
              <div className="rounded-xl border border-border p-6 shadow-sm bg-gradient-to-br from-card to-card/80">
                <Newsletter
                  title={
                    locale === 'ru' ? 'Подпишитесь на рассылку' : 'Subscribe to our newsletter'
                  }
                  description={
                    locale === 'ru'
                      ? 'Получайте наши новости и статьи на почту'
                      : 'Stay updated with our latest news and articles'
                  }
                  buttonText={locale === 'ru' ? 'Подписаться' : 'Subscribe'}
                  placeholderText={locale === 'ru' ? 'Ваш email' : 'Enter your email'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading blog page:', error)
    return notFound()
  }
}
