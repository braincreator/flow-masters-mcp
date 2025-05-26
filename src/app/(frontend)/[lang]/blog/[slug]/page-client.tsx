'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArrowLeft, Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar'
import PostContent from '@/components/blog/PostContent'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ErrorButtonWrapper } from '@/components/blog/ErrorButtonWrapper'
import { BlogActionButtons } from '@/components/blog/BlogActionButtons'
import { Comments } from '@/components/blog/Comments'
import { ScrollToTopButton } from '@/components/blog/ScrollToTopButton'
import { BlogAuthorBio } from '@/components/blog/BlogAuthorBio'
import { BlogRelatedPosts } from '@/components/blog/BlogRelatedPosts'
import { NewsletterWrapper } from '@/components/blog/NewsletterWrapper'

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
  const t = useTranslations('blogPage')

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
              {t('backToBlog')}
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
                  <span>
                    {readTime} {t('minRead')}
                  </span>
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
            {/* Левый сайдбар - содержание и детали */}
            <aside className="blog-sidebar-left">
              <div className="sticky top-24">
                {/* TableOfContents - содержание */}
                <TableOfContents contentSelector="#post-content" title={t('tableOfContents')} />

                {/* Post metadata sidebar section */}
                <div className="mt-4 sidebar-card">
                  <h3 className="font-medium text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {t('postDetails')}
                  </h3>
                  <dl className="text-sm space-y-2 text-muted-foreground">
                    <div>
                      <dt className="inline font-medium mr-1">{t('published')}</dt>
                      <dd className="inline">{format(postDate, 'MMM d, yyyy')}</dd>
                    </div>
                    {post.updatedAt && post.updatedAt !== post.publishedAt && (
                      <div>
                        <dt className="inline font-medium mr-1">{t('updated')}</dt>
                        <dd className="inline">
                          {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="inline font-medium mr-1">{t('readTime')}</dt>
                      <dd className="inline">
                        {readTime} {t('min')}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Categories */}
                {formattedPostCategories.length > 0 && (
                  <div className="mt-4 sidebar-card">
                    <h3 className="font-medium text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                      </svg>
                      {t('categories')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formattedPostCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/${currentLocale}/blog?category=${category.slug}`}
                          className="category-link"
                        >
                          {category.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags in sidebar */}
                <div className="mt-4 sidebar-card">
                  <h3 className="font-medium text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                      <path d="M7 7h.01"></path>
                    </svg>
                    {t('tags')}
                  </h3>
                  {formattedPostTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formattedPostTags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/${currentLocale}/blog?tag=${tag.slug}`}
                          className="tag-link"
                        >
                          {tag.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">{t('noTagsFound')}</div>
                  )}
                </div>

                {/* Author mini-card for sidebar */}
                {post.author && (
                  <div className="mt-4 sidebar-card">
                    <h3 className="font-medium text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {t('author')}
                    </h3>
                    <div className="author-info">
                      {post.author.avatar?.url ? (
                        <Image
                          src={post.author.avatar.url}
                          alt={post.author.name}
                          width={40}
                          height={40}
                          className="author-avatar"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center author-avatar">
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

            {/* Main Content Area */}
            <main className="blog-main-content">
              <ErrorBoundary
                fallback={
                  <ErrorButtonWrapper locale={currentLocale}>
                    {t('errorLoadingContent')}
                  </ErrorButtonWrapper>
                }
              >
                <div className="blog-post-content" id="post-content">
                  <PostContent content={processedContent} debugMode={true} />
                </div>
              </ErrorBoundary>

              {/* Author Bio */}
              {post.author && <BlogAuthorBio author={post.author} />}

              {/* Newsletter Section - только для мобильных и только для неподписанных пользователей */}
              <NewsletterWrapper
                locale={currentLocale}
                storageKey="blog_newsletter_subscription"
                className="blog-newsletter-mobile"
              />

              {/* Comments Section */}
              <section id="comments" className="mt-16 blog-comments">
                <h2 className="text-2xl font-bold mb-8 text-center">{t('comments')}</h2>
                <div id="comments-list">
                  <Comments postId={post.id} locale={currentLocale as 'en' | 'ru'} />
                </div>
              </section>
            </main>

            {/* Правый сайдбар - действия и подписка */}
            <aside className="blog-sidebar-right">
              <div className="sticky top-24">
                {/* Action buttons */}
                <div className="sidebar-card">
                  <h3 className="font-medium text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8"></path>
                      <path d="M9 19.8V15m0 0H4.2M9 15l-6 6"></path>
                      <path d="M15 4.2V9m0 0h4.8M15 9l6-6"></path>
                      <path d="M9 4.2V9m0 0H4.2M9 9 3 3"></path>
                    </svg>
                    {t('actions')}
                  </h3>
                  <div className="action-buttons">
                    <BlogActionButtons
                      postId={post.id}
                      postSlug={post.slug}
                      locale={currentLocale}
                    />
                  </div>
                </div>

                {/* Newsletter в правом сайдбаре с проверкой подписки */}
                <NewsletterWrapper
                  locale={currentLocale}
                  storageKey="blog_newsletter_subscription"
                  className="sidebar-newsletter"
                />
              </div>
            </aside>
          </div>

          {/* Related Posts */}
          {formattedRelatedPosts.length > 0 && (
            <section className="blog-related-posts">
              <h2 className="blog-related-posts-title">{t('relatedPosts')}</h2>
              <BlogRelatedPosts posts={formattedRelatedPosts} locale={currentLocale} />
            </section>
          )}
        </article>
      </div>
    </>
  )
}
