import { Metadata } from 'next'
import { getPayloadClient, retryOnSessionExpired } from '@/utilities/payload'
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
import { formatBlogDate, calculateReadingTime, trackPostView } from '@/lib/blogHelpers'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { isLexicalContent } from '@/utilities/lexicalParser'
import { ErrorButtonWrapper } from '@/components/blog/ErrorButtonWrapper'
import { BlogActionButtons } from '@/components/blog/BlogActionButtons'
import { EnhancedBlogComments } from '@/components/blog/EnhancedBlogComments'

// Импортируем стили
import '@/components/blog/blog-page.css'

interface Props {
  params: Promise<{
    lang: string
    slug: string
  }>
}

/**
 * Глубокая диагностика структуры контента
 */
function analyzeContent(content: any, maxDepth = 3): string {
  if (!content) return 'Контент отсутствует'

  try {
    const type = typeof content

    if (type === 'string') {
      try {
        // Проверяем, может ли это быть JSON
        const parsed = JSON.parse(content)
        return `Строка (JSON): ${analyzeContent(parsed, maxDepth)}`
      } catch {
        // Не JSON, просто строка
        return `Строка (${content.length} символов)`
      }
    }

    if (type !== 'object') {
      return `Примитивный тип: ${type}`
    }

    if (Array.isArray(content)) {
      return `Массив с ${content.length} элементами`
    }

    // Анализ объекта
    const keys = Object.keys(content)
    let info = `Объект с ${keys.length} ключами: ${keys.join(', ')}`

    if (maxDepth > 0) {
      // Проверяем Lexical структуру
      if (content.root && typeof content.root === 'object') {
        info += `\nLexical root содержит ${content.root.children?.length || 0} дочерних элементов`

        // Анализируем первые несколько дочерних элементов
        if (content.root.children && content.root.children.length > 0) {
          info += `\nПервые элементы: ${content.root.children
            .slice(0, 3)
            .map((c: any) => c.type + (c.children ? `(${c.children.length} детей)` : ''))
            .join(', ')}`
        }
      }
    }

    return info
  } catch (e) {
    return `Ошибка анализа: ${e instanceof Error ? e.message : 'неизвестная ошибка'}`
  }
}

export default async function BlogPostPage({ params: paramsPromise }: Props) {
  const { lang, slug } = await paramsPromise
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale

  try {
    const payload = await getPayloadClient()

    // Подготовка контента блога с обработкой ошибок
    let post
    let relatedPosts

    try {
      // Fetch the post by slug с использованием retryOnSessionExpired
      const posts = await retryOnSessionExpired(() =>
        payload.find({
          collection: 'posts',
          where: {
            slug: { equals: slug },
            _status: { equals: 'published' },
          },
          locale: currentLocale,
          depth: 2, // Load relationships 2 levels deep
          limit: 1,
        }),
      )

      if (!posts?.docs || posts.docs.length === 0) {
        return notFound()
      }

      post = posts.docs[0]

      // Get related posts based on categories and tags с использованием retryOnSessionExpired
      relatedPosts = await retryOnSessionExpired(() =>
        payload.find({
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
        }),
      )
    } catch (error) {
      console.error('Error loading blog post:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw error
    }

    // Подготовка контента
    let processedContent = post.content

    // Проверяем и структурируем контент если нужно
    if (processedContent) {
      // Убеждаемся что у контента есть необходимая структура для Lexical
      if (typeof processedContent === 'string') {
        try {
          // Проверяем, является ли строка JSON
          processedContent = JSON.parse(processedContent)
        } catch (e) {
          // Если не JSON, то оставляем как есть
          console.log('[Blog] Контент не является JSON строкой')
        }
      }

      // Логируем информацию о контенте в режиме разработки
      if (process.env.NODE_ENV === 'development') {
        console.log('[Blog] Тип контента:', typeof processedContent)
        if (typeof processedContent === 'object') {
          console.log('[Blog] Ключи контента:', Object.keys(processedContent))
          console.log('[Blog] Анализ контента:', analyzeContent(processedContent))
          console.log('[Blog] Является Lexical контентом:', isLexicalContent(processedContent))
        }
      }
    }

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
          <div className="blog-page-container pt-6">
            <Link
              href={`/${currentLocale}/blog`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentLocale === 'ru' ? 'Назад к блогу' : 'Back to Blog'}
            </Link>
          </div>

          <article className="blog-article">
            {/* Post Header */}
            <header className="blog-header">
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
            </header>

            {/* Hero Image with Parallax Effect */}
            {post.heroImage?.url && (
              <div className="blog-hero-image mb-12 overflow-hidden">
                <div
                  className="blog-post-header-parallax"
                  style={{
                    backgroundImage: `url(${post.heroImage.url})`,
                    backgroundPosition: 'center center',
                  }}
                >
                  <div className="blog-post-header-overlay"></div>
                </div>
                {post.heroImage.alt && (
                  <p className="text-sm text-muted-foreground mt-2 text-center italic">
                    {post.heroImage.alt}
                  </p>
                )}
              </div>
            )}

            {/* Two column layout for content */}
            <div className="blog-content-wrapper">
              {/* Table of Contents - Sidebar on desktop */}
              <aside className="blog-sidebar">
                <div className="sticky top-24">
                  <TableOfContents
                    contentSelector="#post-content"
                    title={currentLocale === 'ru' ? 'Содержание' : 'Table of Contents'}
                  />

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

                  {/* Categories */}
                  {formattedPostCategories.length > 0 && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-medium text-sm mb-3">
                        {currentLocale === 'ru' ? 'Категории' : 'Categories'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {formattedPostCategories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/${currentLocale}/blog?category=${category.slug}`}
                            className="inline-block bg-muted px-3 py-1 rounded-full text-xs font-medium text-primary hover:bg-muted/80 transition-colors"
                          >
                            {category.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags in sidebar */}
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <h3 className="font-medium text-sm mb-3">
                      {currentLocale === 'ru' ? 'Теги' : 'Tags'}
                    </h3>
                    {formattedPostTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formattedPostTags.map((tag) => (
                          <Link
                            key={tag.id}
                            href={`/${currentLocale}/blog?tag=${tag.slug}`}
                            className="inline-block bg-muted/50 px-3 py-1 rounded-full text-xs font-medium text-primary hover:bg-muted transition-colors"
                          >
                            {tag.title}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {currentLocale === 'ru' ? 'Теги не найдены' : 'No tags found'}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium text-sm mb-3">
                      {currentLocale === 'ru' ? 'Действия' : 'Actions'}
                    </h3>
                    <BlogActionButtons
                      postId={post.id}
                      postSlug={post.slug}
                      locale={currentLocale}
                    />
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

              {/* Main content */}
              <div className="blog-main-content">
                {/* Wrap post content in ErrorBoundary to prevent page crashes */}
                <ErrorBoundary
                  fallback={
                    <div className="p-4 border border-red-300 rounded-lg mb-8 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900">
                      <h3 className="text-lg font-bold mb-2">
                        {currentLocale === 'ru' ? 'Ошибка отображения' : 'Display Error'}
                      </h3>
                      <p>
                        {currentLocale === 'ru'
                          ? 'К сожалению, возникла проблема при отображении содержимого статьи.'
                          : 'Unfortunately, there was a problem displaying the content of the article.'}
                      </p>
                      <div className="mt-4">
                        <ErrorButtonWrapper
                          label={currentLocale === 'ru' ? 'Обновить страницу' : 'Reload page'}
                        />
                      </div>
                    </div>
                  }
                >
                  <div className="mx-0">
                    <PostContent
                      content={processedContent}
                      postId={post.id}
                      enableCodeHighlighting={true}
                      enableLineNumbers={true}
                      enhanceHeadings={true}
                      debugMode={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                </ErrorBoundary>

                {/* Author Bio - Full version */}
                {post.author && (
                  <div className="mb-16 p-6 bg-muted/30 rounded-lg blog-author-bio">
                    <BlogAuthorBio author={post.author} />
                  </div>
                )}

                {/* Newsletter Signup */}
                <div className="mb-16 blog-newsletter">
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
                <div id="comments" className="mb-16 blog-comments">
                  <EnhancedBlogComments postId={post.id} locale={currentLocale} />
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {formattedRelatedPosts.length > 0 && (
              <div className="blog-related-posts">
                <h2 className="blog-related-posts-title">
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
    // Улучшенная обработка ошибок
    console.error('Error generating blog post page:', error)
    throw error
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
