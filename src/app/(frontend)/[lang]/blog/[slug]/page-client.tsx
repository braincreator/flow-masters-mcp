'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArrowLeft, Eye } from 'lucide-react'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar'
import PostContent from '@/components/blog/PostContent'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ErrorButtonWrapper } from '@/components/blog/ErrorButtonWrapper'
import { BlogActionButtons } from '@/components/blog/BlogActionButtons'
import { EnhancedBlogComments } from '@/components/blog/EnhancedBlogComments'
import { ScrollToTopButton } from '@/components/blog/ScrollToTopButton'
import { BlogAuthorBio } from '@/components/blog/BlogAuthorBio'
import { BlogRelatedPosts } from '@/components/blog/BlogRelatedPosts'
import { Newsletter } from '@/components/Newsletter'
import { formatBlogDate } from '@/lib/blogHelpers'

// Импортируем стили
import '@/components/blog/blog-page.css'

interface BlogPostPageClientProps {
  post: any
  formattedPostTags: any[]
  formattedPostCategories: any[]
  formattedRelatedPosts: any[]
  currentLocale: string
  postDate: Date
  readTime: number
  processedContent: any
}

export function BlogPostPageClient({
  post,
  formattedPostTags,
  formattedPostCategories,
  formattedRelatedPosts,
  currentLocale,
  postDate,
  readTime,
  processedContent,
}: BlogPostPageClientProps) {
  return (
    <>
      {/* Reading Progress Bar - fixed at top of viewport */}
      <ReadingProgressBar />

      {/* Кнопка прокрутки наверх */}
      <ScrollToTopButton className="scroll-to-top-button" threshold={300} />

      <div className="min-h-screen bg-background pb-20">
        <article className="blog-article">
          {/* Post Header с кнопкой "назад" */}
          <header className="blog-header blog-page-container">
            <Link
              href={`/${currentLocale}/blog`}
              className="blog-back-button text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentLocale === 'ru' ? 'Назад к блогу' : 'Back to Blog'}
            </Link>

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
                  <BlogActionButtons postId={post.id} postSlug={post.slug} locale={currentLocale} />
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
                          className="rounded-full border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-lg font-bold">{post.author.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{post.author.name}</p>
                        {post.author.role && (
                          <p className="text-xs text-muted-foreground">{post.author.role}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="blog-main-content" id="post-content">
              <ErrorBoundary
                fallback={
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <h3 className="text-lg font-bold mb-2 text-destructive">
                      {currentLocale === 'ru'
                        ? 'Ошибка отображения контента'
                        : 'Error rendering content'}
                    </h3>
                    <p className="text-muted-foreground">
                      {currentLocale === 'ru'
                        ? 'К сожалению, возникла проблема с отображением содержимого поста.'
                        : 'There was an issue rendering the post content.'}
                    </p>
                    <div className="mt-4">
                      <ErrorButtonWrapper text="тут" enText="here">
                        <p className="text-sm">
                          {currentLocale === 'ru'
                            ? 'Попробуйте обновить страницу. Если проблема не устранена, пожалуйста, сообщите об этом администратору сайта.'
                            : 'Try refreshing the page. If the issue persists, please report it to the site administrator.'}
                        </p>
                      </ErrorButtonWrapper>
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
    </>
  )
}
