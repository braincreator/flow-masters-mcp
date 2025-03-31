import type { Metadata } from 'next/types'
import configPromise from '@/payload.config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import { cn } from '@/lib/utils'

// Components
import { Container } from '@/components/ui/container'
import { PageHeader } from '@/components/ui/page-header'
import { Filter } from 'lucide-react'
import { PostsGrid } from '@/components/posts/PostsGrid'
import { PostsFilters } from '@/components/posts/PostsFilters'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export const dynamic = 'force-static'
export const revalidate = 600

interface PostsPageProps {
  searchParams: {
    page?: string
    category?: string
    sort?: string
    q?: string
  }
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  try {
    const { page = '1', category, sort = 'latest', q } = searchParams
    const currentPage = parseInt(page, 10)
    const limit = 12

    const payload = await getPayload({ config: configPromise })

    // Build query based on filters
    const query: any = {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    }

    // Add search query filter if provided
    if (q) {
      query.and.push({
        or: [
          {
            title: {
              like: q,
            },
          },
          {
            'meta.description': {
              like: q,
            },
          },
        ],
      })
    }

    // Add category filter if provided
    if (category) {
      query.and.push({
        categories: {
          in: category,
        },
      })
    }

    // Determine sort order
    let sortOptions
    switch (sort) {
      case 'oldest':
        sortOptions = 'createdAt'
        break
      case 'title-asc':
        sortOptions = 'title'
        break
      case 'title-desc':
        sortOptions = '-title'
        break
      case 'latest':
      default:
        sortOptions = '-createdAt'
        break
    }

    // Fetch posts with pagination and filters
    const posts = await payload.find({
      collection: 'posts',
      where: query,
      sort: sortOptions,
      depth: 1,
      page: currentPage,
      limit,
      select: {
        id: true,
        title: true,
        slug: true,
        categories: true,
        meta: true,
        createdAt: true,
        publishedAt: true,
      },
    })

    // Fetch all categories for filters
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    // Format categories for the component
    const formattedCategories = categories.docs.map((category) => ({
      id: category.id,
      title: category.title,
      slug: category.slug,
    }))

    // Check if we have a currently selected category
    const selectedCategory = category
      ? formattedCategories.find((cat) => cat.id === category)
      : null

    return (
      <div className="bg-background min-h-screen pb-16">
        <Container>
          <PageHeader
            title="All Posts"
            description="Browse our latest articles, tutorials, and updates"
            className="pt-16 pb-8"
            actions={
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Filter posts by category and sorting options
                    </SheetDescription>
                  </SheetHeader>
                  <Separator className="my-4" />
                  <PostsFilters
                    categories={formattedCategories}
                    selectedCategory={selectedCategory?.id}
                    selectedSort={sort}
                    searchQuery={q}
                    className="flex flex-col gap-6"
                  />
                </SheetContent>
              </Sheet>
            }
          />

          {/* Selected filters display */}
          {(selectedCategory || q) && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-muted-foreground">Filters:</span>
              {selectedCategory && (
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  <span className="mr-1">Category:</span> {selectedCategory.title}
                </div>
              )}
              {q && (
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                  <span className="mr-1">Search:</span> "{q}"
                </div>
              )}
              <a
                href="/posts"
                className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-muted/80"
              >
                Clear filters
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar - Desktop only */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <PostsFilters
                  categories={formattedCategories}
                  selectedCategory={selectedCategory?.id}
                  selectedSort={sort}
                  searchQuery={q}
                  className="flex flex-col gap-6"
                />
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-9">
              {/* Results count & sorting */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-xl font-medium">
                  {posts.totalDocs} {posts.totalDocs === 1 ? 'Post' : 'Posts'}
                  {selectedCategory && ` in ${selectedCategory.title}`}
                  {q && ` matching "${q}"`}
                </h2>
              </div>

              {/* Posts grid */}
              <PostsGrid
                posts={posts.docs}
                emptyMessage={
                  q || category
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
                              ...(q ? { q } : {}),
                              ...(category ? { category } : {}),
                              ...(sort && sort !== 'latest' ? { sort } : {}),
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
          </div>
        </Container>
      </div>
    )
  } catch (error) {
    console.error('Error loading posts page:', error)
    return notFound()
  }
}

export function generateMetadata(): Metadata {
  return {
    title: 'All Posts',
    description: 'Browse our latest articles, tutorials, and updates',
  }
}
