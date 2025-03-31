import { Metadata } from 'next'
import { getPayloadClient } from '@/utilities/payload'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import RichText from '@/components/RichText'
import { BlogAuthorBio } from '@/components/blog/BlogAuthorBio'
import { BlogSocialShare } from '@/components/blog/BlogSocialShare'
import { BlogComments } from '@/components/blog/BlogComments'
import { BlogRelatedPosts } from '@/components/blog/BlogRelatedPosts'
import { BlogTagCloud } from '@/components/blog/BlogTagCloud'

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
      await fetch(`/api/blog/metrics?postId=${post.id}&type=view`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to track post view:', error)
    }

    // Get related posts
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

    return (
      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-12">
          {/* Post Header */}
          <div className="max-w-4xl mx-auto mb-10 text-center">
            {formattedPostCategories.length > 0 && (
              <div className="mb-4 flex justify-center gap-2">
                {formattedPostCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${currentLocale}/blog?category=${category.slug}`}
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{post.title}</h1>

            {post.excerpt && <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>}

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {post.author && (
                <div className="flex items-center gap-2">
                  {post.author.avatar?.url && (
                    <Image
                      src={post.author.avatar.url}
                      alt={post.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span>{post.author.name}</span>
                </div>
              )}

              <time dateTime={postDate.toISOString()}>{format(postDate, 'MMMM d, yyyy')}</time>

              {post.readTime && <span>{post.readTime} min read</span>}
            </div>
          </div>

          {/* Hero Image */}
          {post.heroImage?.url && (
            <div className="max-w-5xl mx-auto mb-12">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={post.heroImage.url}
                  alt={post.heroImage.alt || post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Post Content */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="prose dark:prose-invert prose-lg prose-headings:font-bold prose-a:text-primary max-w-none">
              <RichText data={post.content} />
            </div>
          </div>

          {/* Tags & Sharing */}
          <div className="max-w-3xl mx-auto mb-16 flex flex-wrap gap-6 justify-between items-center">
            {formattedPostTags.length > 0 && (
              <div className="flex-1">
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

          {/* Author Bio */}
          {post.author && (
            <div className="max-w-3xl mx-auto mb-16">
              <BlogAuthorBio author={post.author} />
            </div>
          )}

          {/* Comments */}
          <div className="max-w-3xl mx-auto mb-16">
            <BlogComments postId={post.id} />
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
          }
        : undefined,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post | Flow Masters',
    }
  }
}
