import { Metadata } from 'next'
import { DEFAULT_LOCALE, type Locale } from '@/constants'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload/index'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'

// Simple page for testing blog functionality
type PageParams = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const params = await paramsPromise
  const locale = (params.lang || DEFAULT_LOCALE) as Locale

  setRequestLocale(locale)
  const t = await getTranslations('blogPage')

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function SimpleBlogPage(props: PageParams) {
  try {
    const { lang } = await props.params
    const locale = (lang || DEFAULT_LOCALE) as Locale
    setRequestLocale(locale)
    const t = await getTranslations('blogPage')

    console.log('Simple blog page - starting...')

    // Initialize PayloadCMS client
    const payload = await getPayloadClient()
    console.log('Payload client initialized')

    // Try the simplest possible query first
    let posts
    try {
      posts = await payload.find({
        collection: 'posts',
        limit: 10,
        depth: 0, // No relations
      })
      console.log('Simple query successful:', posts.docs.length, 'posts found')
    } catch (error) {
      console.error('Simple query failed:', error)
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Blog (Debug Mode)</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> Failed to fetch posts
            <br />
            <code>{error.message}</code>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('title')} (Simple Mode)</h1>
          <p className="text-lg text-muted-foreground">{t('description')}</p>
        </div>

        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <strong>Debug Info:</strong> Found {posts.totalDocs} total posts, showing {posts.docs.length}
        </div>

        {posts.docs.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No posts found</h2>
            <p className="text-muted-foreground">
              There are no posts in the database yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((post) => (
              <div key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <div className="text-sm text-muted-foreground mb-2">
                  Status: {post._status || 'unknown'}
                </div>
                {post.publishedAt && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Published: {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                )}
                {post.excerpt && (
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  ID: {post.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Simple blog page error:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Blog (Error)</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Critical Error:</strong> {error.message}
        </div>
      </div>
    )
  }
}
