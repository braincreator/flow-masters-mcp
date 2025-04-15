'use client'
import React from 'react'
import Image from 'next/image'
import type { BlogPostBlock as BlogPostBlockType } from '@/types/blocks'
import { GridContainer } from '@/components/shared/GridContainer'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { ReadingProgressBar } from '@/components/blog/ReadingProgressBar'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { Comments } from '@/components/blog/Comments'
import { BlogRelatedPosts } from '@/components/blog/BlogRelatedPosts'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'
import { formatDate, calculateReadingTime } from '@/lib/blogHelpers'
import { cn } from '@/lib/utils'

export function BlogPost({
  post,
  relatedPosts,
  showTableOfContents = true,
  showAuthor = true,
  showDate = true,
  showReadingTime = true,
  showComments = true,
  showShareButtons = true,
  showRelatedPosts = true,
  showTags = true,
  showReadingProgress = true,
  settings,
}: BlogPostBlockType) {
  const readingTime = post?.readingTime ?? (post?.content ? calculateReadingTime(post.content) : 0)

  if (!post) {
    return null
  }

  return (
    <>
      {/* Reading progress bar */}
      {showReadingProgress && <ReadingProgressBar gradient />}

      <GridContainer settings={settings} className="py-12">
        <article className="max-w-3xl mx-auto">
          {/* Post header */}
          <header className="mb-10">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="mb-3">
                <BlogTagCloud tags={post.categories} type="categories" showCount={false} />
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight mb-4 md:text-5xl">{post.title}</h1>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {/* Author */}
              {showAuthor && post.author && (
                <div className="flex items-center">
                  <AuthorCard author={post.author} variant="compact" showBio={false} />
                </div>
              )}

              {/* Publication date */}
              {showDate && post.publishedAt && (
                <div>
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </div>
              )}

              {/* Reading time */}
              {showReadingTime && (
                <div>
                  {readingTime} {post.locale === 'ru' ? 'мин чтения' : 'min read'}
                </div>
              )}
            </div>
          </header>

          {/* Featured image */}
          {post.featuredImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-10">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content layout with optional sidebar */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Sidebar (desktop) */}
            {(showTableOfContents || showShareButtons) && (
              <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20 lg:self-start space-y-8">
                {/* Table of contents */}
                {showTableOfContents && post.content && <TableOfContents content={post.content} />}

                {/* Share buttons */}
                {showShareButtons && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      {post.locale === 'ru' ? 'Поделиться' : 'Share'}
                    </h4>
                    <ShareButtons
                      title={post.title}
                      url={`/blog/${post.slug}`}
                      description={post.excerpt}
                      iconOnly
                      variant="ghost"
                      trackShares
                      postId={post.id}
                      locale={post.locale}
                    />
                  </div>
                )}
              </aside>
            )}

            {/* Main content */}
            <div
              className={cn(
                'lg:col-span-9',
                showTableOfContents || showShareButtons ? '' : 'lg:col-start-2',
              )}
            >
              {/* Post content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">{post.content}</div>

              {/* Tags */}
              {showTags && post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <BlogTagCloud tags={post.tags} />
                </div>
              )}

              {/* Share buttons (mobile) */}
              {showShareButtons && (
                <div className="mt-8 lg:hidden">
                  <h4 className="text-sm font-medium mb-3">
                    {post.locale === 'ru' ? 'Поделиться статьей' : 'Share this post'}
                  </h4>
                  <ShareButtons
                    title={post.title}
                    url={`/blog/${post.slug}`}
                    description={post.excerpt}
                    trackShares
                    postId={post.id}
                    locale={post.locale}
                  />
                </div>
              )}

              {/* Author bio */}
              {showAuthor && post.author && (
                <div className="mt-12 pt-8 border-t">
                  <h4 className="text-sm font-medium uppercase tracking-wider mb-4">
                    {post.locale === 'ru' ? 'Об авторе' : 'About the author'}
                  </h4>
                  <AuthorCard author={post.author} variant="expanded" showBio showSocial />
                </div>
              )}

              {/* Comments section */}
              {showComments && (
                <div className="mt-12 pt-8 border-t">
                  <Comments postId={post.id} />
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Related posts */}
        {showRelatedPosts && relatedPosts && relatedPosts.length > 0 && (
          <BlogRelatedPosts currentPostId={post.id} posts={relatedPosts} />
        )}
      </GridContainer>
    </>
  )
}

export const BlogPostBlock = BlogPost
export default BlogPost
