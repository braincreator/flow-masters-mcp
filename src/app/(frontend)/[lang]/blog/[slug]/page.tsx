import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { BlogAuthorBio } from '@/components/blog/BlogAuthorBio'
import { BlogSocialShare } from '@/components/blog/BlogSocialShare'
import { BlogComments } from '@/components/blog/BlogComments'
import { BlogRelatedPosts } from '@/components/blog/BlogRelatedPosts'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar'
import PostContent from '@/components/blog/PostContent'
import { PayloadAPIProvider } from '@/providers/payload'
import { Newsletter } from '@/components/Newsletter'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bookmark, BookmarkCheck, Eye, MessageCircle, Share2 } from 'lucide-react'
import { formatBlogDate, calculateReadingTime } from '@/lib/blogHelpers'

interface Props {
  params: Promise<{
    lang: string
    slug: string
  }>
}

export default async function BlogPostPage({ params: paramsPromise }: Props) {
  const { lang, slug } = await paramsPromise
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  try {
    const payload = await getPayloadClient()

    // Fetch the post by slug
    const posts = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        _status: { equals: 'published' },
      },
      locale: currentLocale,
      depth: 2, // Load relationships 2 levels deep
      limit: 1,
    })

    if (!posts?.docs || posts.docs.length === 0) {
      return notFound()
    }

    const post = posts.docs[0]

    // Track post view (metrics)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/blog/metrics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: post.id,
            action: 'view',
          }),
        },
      )
    } catch (error) {
      console.error('Failed to track post view:', error)
    }

    // Get related posts based on categories and tags
    const relatedPosts = await payload.find({
      collection: 'posts',
      where: {
        _status: { equals: 'published' },
        id: { not_equals: post.id },
        or: [
          { 'categories.id': { in: post.categories?.map((cat) => cat.id) || [] } },
          { 'tags.id': { in: post.tags?.map((tag) => tag.id) || [] } },
        ],
      },
      locale: currentLocale,
      depth: 1,
      limit: 3,
      sort: '-publishedAt',
    })

    // Format the post data for components
    const formattedPostTags =
      post.tags?.map((tag) => ({
        id: tag.id?.toString(),
        title: tag.title,
        slug: tag.slug,
      })) || []

    const formattedPostCategories =
      post.categories?.map((cat) => ({
        id: cat.id?.toString(),
        title: cat.title,
        slug: cat.slug,
      })) || []

    // Format related posts for the component
    const formattedRelatedPosts = relatedPosts.docs.map((post) => ({
      id: post.id?.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      heroImage: post.heroImage
        ? {
            url: post.heroImage.url,
            alt: post.heroImage.alt || '',
          }
        : undefined,
      categories: post.categories?.map((cat) => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
      })),
    }))

    const postDate = post.publishedAt ? new Date(post.publishedAt) : new Date()

    // Get estimate reading time if not provided
    const readTime = post.readTime || calculateReadingTime(JSON.stringify(post.content)) || 5

    return (
      <PayloadAPIProvider>
        {/* Reading Progress Bar - fixed at top of viewport */}
        <ReadingProgressBar />

        <div className="min-h-screen bg-background pb-20">
          {/* Back to blog link */}
          <div className="container mx-auto px-4 pt-6">
            <Link
              href={`/${currentLocale}/blog`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentLocale === 'ru' ? 'Назад к блогу' : 'Back to Blog'}
            </Link>
          </div>

          <article className="container mx-auto px-4">
            {/* Post Header */}
            <header className="max-w-4xl mx-auto mb-10 text-center">
              {formattedPostCategories.length > 0 && (
                <div className="mb-4 flex justify-center gap-2 flex-wrap">
                  {formattedPostCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/${currentLocale}/blog?category=${category.slug}`}
                      className="inline-block bg-muted/50 px-3 py-1 rounded-full text-xs font-medium text-primary hover:bg-muted transition-colors"
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                {post.author && (
                  <div className="flex items-center gap-2">
                    {post.author.avatar?.url ? (
                      <Image
                        src={post.author.avatar.url}
                        alt={post.author.name}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-bold">{post.author.name.charAt(0)}</span>
                      </div>
                    )}
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-6">
                  <time dateTime={postDate.toISOString()} className="flex items-center gap-1">
                    <span className="sr-only">Published on:</span>
                    {formatBlogDate(postDate, currentLocale)}
                  </time>

                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{readTime} min read</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <Button variant="outline" size="sm" className="gap-2">
                  <BookmarkCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Comment</span>
                </Button>
              </div>
            </header>

            {/* Hero Image */}
            {post.heroImage?.url && (
              <div className="max-w-5xl mx-auto mb-12">
                <div className="aspect-[2/1] md:aspect-[2.3/1] relative rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={post.heroImage.url}
                    alt={post.heroImage.alt || post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                </div>
                {post.heroImage.alt && (
                  <p className="text-sm text-muted-foreground mt-2 text-center italic">
                    {post.heroImage.alt}
                  </p>
                )}
              </div>
            )}

            {/* Two column layout for content */}
            <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto">
              {/* Table of Contents - Sidebar on desktop */}
              <aside className="lg:w-64 xl:w-72 shrink-0 order-1 lg:order-0">
                <div className="sticky top-24">
                  <TableOfContents contentSelector="#post-content" />

                  {/* Post metadata sidebar section */}
                  <div className="mt-10 p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium text-sm mb-3">
                      {currentLocale === 'ru' ? 'Детали статьи' : 'Post Details'}
                    </h3>
                    <dl className="text-sm space-y-2 text-muted-foreground">
                      <div>
                        <dt className="inline font-medium mr-1">
                          {currentLocale === 'ru' ? 'Опубликовано:' : 'Published:'}
                        </dt>
                        <dd className="inline">{format(postDate, 'MMM d, yyyy')}</dd>
                      </div>
                      {post.updatedAt && post.updatedAt !== post.publishedAt && (
                        <div>
                          <dt className="inline font-medium mr-1">
                            {currentLocale === 'ru' ? 'Обновлено:' : 'Updated:'}
                          </dt>
                          <dd className="inline">
                            {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="inline font-medium mr-1">
                          {currentLocale === 'ru' ? 'Время чтения:' : 'Read time:'}
                        </dt>
                        <dd className="inline">{readTime} min</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Author mini-card for sidebar */}
                  {post.author && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-medium text-sm mb-3">
                        {currentLocale === 'ru' ? 'Автор' : 'Author'}
                      </h3>
                      <div className="flex items-center gap-3">
                        {post.author.avatar?.url ? (
                          <Image
                            src={post.author.avatar.url}
                            alt={post.author.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-lg font-bold">{post.author.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{post.author.name}</p>
                          <Link
                            href={`/${currentLocale}/blog?author=${post.author.id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            {currentLocale === 'ru' ? 'Все статьи автора' : 'View all posts'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* Post Content - Main column */}
              <div className="lg:flex-1 max-w-3xl mx-auto order-0 lg:order-1">
                <div id="post-content">
                  <PostContent
                    content={post.content}
                    postId={post.id}
                    enableCodeHighlighting={true}
                    enableLineNumbers={true}
                    enhanceHeadings={true}
                  />
                </div>

                {/* Tags & Sharing */}
                <div className="mt-12 mb-16 flex flex-wrap gap-6 justify-between items-center border-t border-b border-border py-6">
                  {formattedPostTags.length > 0 && (
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-2">
                        {currentLocale === 'ru' ? 'Теги' : 'Tags'}
                      </h3>
                      <BlogTagCloud tags={formattedPostTags} />
                    </div>
                  )}

                  <BlogSocialShare
                    url={`/${currentLocale}/blog/${post.slug}`}
                    title={post.title}
                    description={post.excerpt || ''}
                    postId={post.id}
                  />
                </div>

                {/* Author Bio - Full version */}
                {post.author && (
                  <div className="mb-16 p-6 bg-muted/30 rounded-lg">
                    <BlogAuthorBio author={post.author} />
                  </div>
                )}

                {/* Newsletter Signup */}
                <div className="mb-16">
                  <Newsletter
                    title={
                      currentLocale === 'ru'
                        ? 'Подпишитесь на нашу рассылку'
                        : 'Subscribe to our newsletter'
                    }
                    description={
                      currentLocale === 'ru'
                        ? 'Получайте уведомления о новых статьях и эксклюзивный контент'
                        : 'Get notified about new articles and exclusive content'
                    }
                  />
                </div>

                {/* Comments */}
                <div id="comments" className="mb-16">
                  <h2 className="text-2xl font-bold mb-6">
                    {currentLocale === 'ru' ? 'Комментарии' : 'Comments'}
                  </h2>
                  <BlogComments postId={post.id} />
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {formattedRelatedPosts.length > 0 && (
              <div className="max-w-5xl mx-auto mt-20">
                <h2 className="text-2xl font-bold mb-8 text-center">
                  {currentLocale === 'ru' ? 'Похожие статьи' : 'Related Posts'}
                </h2>
                <BlogRelatedPosts posts={formattedRelatedPosts} />
              </div>
            )}
          </article>
        </div>
      </PayloadAPIProvider>
    )
  } catch (error) {
    console.error('Error loading blog post:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    return notFound()
  }
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await paramsPromise
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  try {
    const payload = await getPayloadClient()

    // Fetch the post by slug for metadata
    const posts = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        _status: { equals: 'published' },
      },
      locale: currentLocale,
      depth: 1,
      limit: 1,
    })

    if (!posts?.docs || posts.docs.length === 0) {
      return {
        title: 'Post Not Found',
      }
    }

    const post = posts.docs[0]

    return {
      title: `${post.title} | Flow Masters Blog`,
      description: post.excerpt || '',
      openGraph: post.heroImage?.url
        ? {
            images: [{ url: post.heroImage.url, alt: post.heroImage.alt || post.title }],
            type: 'article',
            publishedTime: post.publishedAt,
            authors: post.author ? [post.author.name] : undefined,
            tags: post.tags?.map((tag) => tag.title),
          }
        : undefined,
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || '',
        images: post.heroImage?.url ? [post.heroImage.url] : undefined,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post | Flow Masters',
    }
  }
}
