import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'

  const robotsTxt = `# Robots.txt for Flow Masters
# Generated automatically

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /payload/
Disallow: /*.json
Disallow: /*.xml$
Disallow: /search?*
Allow: /api/webhooks/
Allow: /sitemap.xml
Allow: /robots.txt

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 1

User-agent: Yandex
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 1

# Block AI training bots (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/pages-sitemap.xml
Sitemap: ${baseUrl}/posts-sitemap.xml
Sitemap: ${baseUrl}/services-sitemap.xml

# RSS Feeds
# RSS feeds available at:
# ${baseUrl}/rss.xml (Russian blog posts)
# ${baseUrl}/rss-en.xml (English blog posts)
# ${baseUrl}/services-rss.xml (Services feed)
# ${baseUrl}/atom.xml (Atom format)

# Host directive (for Yandex)
Host: ${baseUrl.replace('https://', '').replace('http://', '')}
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  })
}
