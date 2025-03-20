import { getSiteConfig } from '@/utilities/get-site-config'

export async function BlogList() {
  const siteConfig = await getSiteConfig()
  
  if (!siteConfig?.features?.blog?.enabled) {
    return null
  }

  const postsPerPage = siteConfig.features.blog.postsPerPage || 10

  // Use postsPerPage in your blog fetching logic
  return (
    <div className="blog-list">
      {/* Blog posts rendering logic */}
    </div>
  )
}