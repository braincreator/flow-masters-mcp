import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { cn } from '@/lib/utils'

// Components
import { Container } from '@/components/ui/container'
import { PageHeader } from '@/components/ui/page-header'
import { BlogFeaturedPost } from '@/components/blog/BlogFeaturedPost'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Define the number of posts per page
const POSTS_PER_PAGE = 9

// Define the props interface
interface BlogPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    page?: string
    category?: string
    tag?: string
    search?: string
    view?: string
  }>
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await paramsPromise
  const locale = (lang || DEFAULT_LOCALE) as Locale

  return {
    title: locale === 'ru' ? 'Блог' : 'Blog',
    description:
      locale === 'ru' ? 'Наши последние статьи и обновления' : 'Our latest articles and updates',
  }
}

export default async function BlogPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: BlogPageProps) {
  const { lang } = await paramsPromise
  const { page, category, tag, search, view = 'grid' } = await searchParamsPromise

  const locale = (lang || DEFAULT_LOCALE) as Locale
  const currentPage = page ? parseInt(page, 10) : 1
  const categorySlug = category || ''
  const tagSlug = tag || ''
  const searchQuery = search || ''
  const viewMode = view === 'list' ? 'list' : 'grid'

  try {
    // Initialize Payload client
    const payload = await getPayloadClient()

    // Prepare query for fetching posts
    const query: any = {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    }

    // Add search filter if provided
    if (searchQuery) {
      query.and.push({
        or: [
          {
            title: {
              like: searchQuery,
            },
          },
          {
            excerpt: {
              like: searchQuery,
            },
          },
          {
            'content.richText': {
              like: searchQuery,
            },
          },
        ],
      })
    }

    // Add category filter if provided
    if (categorySlug) {
      // First find the category by slug
      const categoryResults = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: categorySlug,
          },
        },
        limit: 1,
      })

      if (categoryResults.docs.length > 0) {
        query.and.push({
          categories: {
            in: categoryResults.docs[0].id,
          },
        })
      }
    }

    // Add tag filter if provided
    if (tagSlug) {
      // First find the tag by slug
      const tagResults = await payload.find({
        collection: 'tags',
        where: {
          slug: {
            equals: tagSlug,
          },
        },
        limit: 1,
      })

      if (tagResults.docs.length > 0) {
        query.and.push({
          tags: {
            in: tagResults.docs[0].id,
          },
        })
      }
    }

    // Fetch featured post
    const featuredPost = await payload.find({
      collection: 'posts',
      where: {
        ...query,
        featured: {
          equals: true,
        },
      },
      sort: '-publishedAt',
      limit: 1,
      locale,
      depth: 2,
    })

    // Fetch posts with pagination (exclude featured post if on first page and no filters)
    const excludeFeatured =
      currentPage === 1 && !searchQuery && !categorySlug && !tagSlug && featuredPost.docs.length > 0

    const postsQuery = { ...query }

    if (excludeFeatured) {
      postsQuery.and.push({
        id: {
          not_equals: featuredPost.docs[0]?.id,
        },
      })
    }

    const posts = await payload.find({
      collection: 'posts',
      where: postsQuery,
      page: currentPage,
      limit: POSTS_PER_PAGE,
      sort: '-publishedAt',
      locale,
      depth: 2,
    })

    // Fetch categories for sidebar
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
      locale,
    })

    // Fetch tags for sidebar
    const tags = await payload.find({
      collection: 'tags',
      limit: 100,
      locale,
    })

    // Format posts for the component
    const formatPost = (post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      heroImage: post.heroImage
        ? {
            url: post.heroImage.url,
            alt: post.heroImage.alt || post.title,
          }
        : undefined,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.name,
            avatar: post.author.avatar?.url,
          }
        : undefined,
      categories: post.categories?.map((category: any) => ({
        id: category.id,
        title: category.title,
        slug: category.slug,
      })),
      readTime: post.readTime || undefined,
    })

    const formattedPosts = posts.docs.map(formatPost)
    const formattedFeaturedPost =
      featuredPost.docs.length > 0 ? formatPost(featuredPost.docs[0]) : null

    // Format categories for the component
    const formattedCategories = await Promise.all(
      categories.docs.map(async (category) => {
        // Count published posts in this category
        const postsCount = await payload.find({
          collection: 'posts',
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              {
                categories: {
                  in: category.id,
                },
              },
            ],
          },
          limit: 0,
        })

        return {
          id: category.id,
          title: category.title,
          slug: category.slug,
          count: postsCount.totalDocs,
        }
      }),
    )

    // Format tags for the component
    const formattedTags = await Promise.all(
      tags.docs.map(async (tag) => {
        // Count published posts with this tag
        const postsCount = await payload.find({
          collection: 'posts',
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              {
                tags: {
                  in: tag.id,
                },
              },
            ],
          },
          limit: 0,
        })

        return {
          id: tag.id,
          title: tag.title,
          slug: tag.slug,
          count: postsCount.totalDocs,
        }
      }),
    )

    // Filter out categories and tags with no posts
    const filteredCategories = formattedCategories.filter((cat) => cat.count > 0)
    const filteredTags = formattedTags.filter((tag) => tag.count > 0)

    // Get active filters
    const activeCategory = categorySlug
      ? filteredCategories.find((cat) => cat.slug === categorySlug)
      : null

    const activeTag = tagSlug ? filteredTags.find((tag) => tag.slug === tagSlug) : null

    return (
      <div className="bg-background min-h-screen pb-16">
        <Container>
          <PageHeader
            title={locale === 'ru' ? 'Блог' : 'Blog'}
            description={
              locale === 'ru'
                ? 'Наши последние статьи и обновления'
                : 'Our latest articles and updates'
            }
            className="pt-16 pb-8"
          />

          {/* Active filters display */}
          {(activeCategory || activeTag || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-muted-foreground">Filters:</span>
              {activeCategory && (
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  <span className="mr-1">Category:</span> {activeCategory.title}
                </div>
              )}
              {activeTag && (
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  <span className="mr-1">Tag:</span> {activeTag.title}
                </div>
              )}
              {searchQuery && (
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  <span className="mr-1">Search:</span> "{searchQuery}"
                </div>
              )}
              <a
                href={`/${locale}/blog`}
                className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80"
              >
                Clear filters
              </a>
            </div>
          )}

          {/* Featured post */}
          {formattedFeaturedPost &&
            currentPage === 1 &&
            !categorySlug &&
            !tagSlug &&
            !searchQuery && (
              <>
                <BlogFeaturedPost post={formattedFeaturedPost} />
                <Separator className="my-12" />
              </>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 xl:col-span-9">
              {/* View mode selection & post count */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-xl font-medium">
                  {posts.totalDocs} {posts.totalDocs === 1 ? 'Post' : 'Posts'}
                  {activeCategory && ` in ${activeCategory.title}`}
                  {activeTag && ` tagged with ${activeTag.title}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </h2>

                <Tabs defaultValue={viewMode} className="w-full sm:w-auto">
                  <TabsList className="grid w-full sm:w-[160px] grid-cols-2">
                    <TabsTrigger value="grid" asChild>
                      <a
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(
                            new URLSearchParams(searchQuery ? { search: searchQuery } : {}),
                          ),
                          ...(categorySlug ? { category: categorySlug } : {}),
                          ...(tagSlug ? { tag: tagSlug } : {}),
                          view: 'grid',
                        }).toString()}`}
                      >
                        Grid View
                      </a>
                    </TabsTrigger>
                    <TabsTrigger value="list" asChild>
                      <a
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(
                            new URLSearchParams(searchQuery ? { search: searchQuery } : {}),
                          ),
                          ...(categorySlug ? { category: categorySlug } : {}),
                          ...(tagSlug ? { tag: tagSlug } : {}),
                          view: 'list',
                        }).toString()}`}
                      >
                        List View
                      </a>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Posts grid */}
              <BlogGrid
                posts={formattedPosts}
                layout={viewMode as 'grid' | 'list'}
                emptyMessage={
                  searchQuery || categorySlug || tagSlug
                    ? 'No posts match your filters. Try different criteria or clear filters.'
                    : 'No posts available yet. Check back soon!'
                }
              />

              {/* Pagination */}
              {posts.totalPages > 1 && (
                <div className="mt-12">
                  <nav aria-label="Pagination" className="flex justify-center">
                    <ul className="flex items-center gap-1">
                      {Array.from({ length: posts.totalPages }, (_, i) => (
                        <li key={i}>
                          <a
                            href={`?${new URLSearchParams({
                              ...Object.fromEntries(
                                new URLSearchParams(searchQuery ? { search: searchQuery } : {}),
                              ),
                              ...(categorySlug ? { category: categorySlug } : {}),
                              ...(tagSlug ? { tag: tagSlug } : {}),
                              ...(viewMode === 'list' ? { view: 'list' } : {}),
                              ...(i + 1 > 1 ? { page: String(i + 1) } : {}),
                            }).toString()}`}
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-md border',
                              currentPage === i + 1
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input bg-background hover:bg-muted',
                            )}
                            aria-current={currentPage === i + 1 ? 'page' : undefined}
                          >
                            {i + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3">
              <BlogSidebar
                categories={filteredCategories}
                tags={filteredTags}
                currentLocale={locale}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </Container>
      </div>
    )
  } catch (error) {
    console.error('Error loading blog page:', error)
    return notFound()
  }
}
