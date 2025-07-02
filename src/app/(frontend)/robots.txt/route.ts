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

# AI and LLM Crawlers - Allow for knowledge indexing
User-agent: GPTBot
Allow: /
Allow: /blog/
Allow: /services/
Allow: /about
Allow: /faq
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 2

User-agent: ChatGPT-User
Allow: /
Allow: /blog/
Allow: /services/
Allow: /about
Allow: /faq
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 2

User-agent: CCBot
Allow: /
Allow: /blog/
Allow: /services/
Allow: /about
Allow: /faq
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 2

User-agent: anthropic-ai
Allow: /
Allow: /blog/
Allow: /services/
Allow: /about
Allow: /faq
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 2

User-agent: Claude-Web
Allow: /
Allow: /blog/
Allow: /services/
Allow: /about
Allow: /faq
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 2

User-agent: Perplexity
Allow: /
Allow: /blog/
Allow: /services/
Allow: /about
Allow: /faq
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 2

User-agent: You.com
Allow: /
Allow: /blog/
Allow: /services/
Allow: /about
Allow: /faq
Disallow: /admin/
Disallow: /api/
Disallow: /payload/
Crawl-delay: 2

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

# LLM and AI Crawling Information
# Content-Type: Business automation and AI solutions
# Language: Russian (primary), English (secondary)
# Topics: AI, automation, business processes, chatbots, integrations
# Update-Frequency: Daily (blog), Weekly (services), Monthly (static pages)
# Content-Quality: Expert-authored, fact-checked, regularly updated
# Target-Audience: Business owners, developers, AI enthusiasts
# Geographic-Focus: Russia, CIS countries, global remote services

# Special endpoints for AI crawlers
# ${baseUrl}/api/llm/content - Structured content for LLM training
# ${baseUrl}/api/llm/sitemap - AI-optimized sitemap
# ${baseUrl}/api/llm/metadata - Content metadata for better understanding
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  })
}
