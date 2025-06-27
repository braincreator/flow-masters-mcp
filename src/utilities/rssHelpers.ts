/**
 * RSS Feed Utilities for Flow Masters
 * Provides helper functions for RSS feed generation and management
 */

export interface RssFeedConfig {
  title: string
  description: string
  language: string
  baseUrl: string
  feedUrl: string
  managingEditor: string
  webMaster: string
}

export interface RssItem {
  title: string
  link: string
  guid: string
  description: string
  content?: string
  pubDate: string
  author?: string
  categories?: string[]
}

/**
 * Escape XML special characters
 */
export function escapeXml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Generate RSS item XML
 */
export function generateRssItem(item: RssItem): string {
  const categories = item.categories 
    ? item.categories.map(cat => `<category><![CDATA[${cat}]]></category>`).join('\n      ')
    : ''

  return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.guid}</guid>
      <description><![CDATA[${item.description}]]></description>
      ${item.content ? `<content:encoded><![CDATA[${item.content}]]></content:encoded>` : ''}
      <pubDate>${item.pubDate}</pubDate>
      ${item.author ? `<author>${item.author}</author>` : ''}
      ${categories}
    </item>`
}

/**
 * Generate complete RSS feed XML
 */
export function generateRssFeed(config: RssFeedConfig, items: RssItem[]): string {
  const currentDate = new Date().toUTCString()
  const rssItems = items.map(item => generateRssItem(item)).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${config.baseUrl}</link>
    <description>${escapeXml(config.description)}</description>
    <language>${config.language}</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <managingEditor>${config.managingEditor}</managingEditor>
    <webMaster>${config.webMaster}</webMaster>
    <generator>Flow Masters CMS</generator>
    <image>
      <url>${config.baseUrl}/favicon.ico</url>
      <title>${escapeXml(config.title)}</title>
      <link>${config.baseUrl}</link>
    </image>
    <atom:link href="${config.feedUrl}" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`
}

/**
 * Generate Atom feed entry XML
 */
export function generateAtomEntry(item: RssItem): string {
  const published = item.pubDate
  const updated = item.pubDate
  const categories = item.categories 
    ? item.categories.map(cat => `<category term="${escapeXml(cat)}" />`).join('\n    ')
    : ''

  return `
  <entry>
    <title type="text">${escapeXml(item.title)}</title>
    <link href="${item.link}" rel="alternate" type="text/html"/>
    <id>${item.guid}</id>
    <published>${new Date(published).toISOString()}</published>
    <updated>${new Date(updated).toISOString()}</updated>
    ${item.author ? `<author><name>${escapeXml(item.author.replace(/.*\(([^)]+)\).*/, '$1'))}</name></author>` : ''}
    <summary type="text">${escapeXml(item.description)}</summary>
    ${item.content ? `<content type="html"><![CDATA[${item.content}]]></content>` : ''}
    ${categories}
  </entry>`
}

/**
 * Generate complete Atom feed XML
 */
export function generateAtomFeed(config: RssFeedConfig, items: RssItem[]): string {
  const currentDate = new Date().toISOString()
  const lastUpdated = items.length > 0 
    ? new Date(items[0].pubDate).toISOString()
    : currentDate
  
  const atomEntries = items.map(item => generateAtomEntry(item)).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.title)}</title>
  <subtitle>${escapeXml(config.description)}</subtitle>
  <link href="${config.baseUrl}" rel="alternate" type="text/html"/>
  <link href="${config.feedUrl}" rel="self" type="application/atom+xml"/>
  <id>${config.feedUrl}</id>
  <updated>${lastUpdated}</updated>
  <author>
    <name>Flow Masters</name>
    <email>admin@flow-masters.ru</email>
  </author>
  <generator uri="${config.baseUrl}" version="1.0">Flow Masters CMS</generator>
  <icon>${config.baseUrl}/favicon.ico</icon>
  <logo>${config.baseUrl}/favicon.ico</logo>
  <rights>© ${new Date().getFullYear()} Flow Masters. Все права защищены.</rights>
  ${atomEntries}
</feed>`
}

/**
 * Get RSS feed URLs for the site
 */
export function getRssFeedUrls(baseUrl: string) {
  return {
    blog: `${baseUrl}/rss.xml`,
    blogEn: `${baseUrl}/rss-en.xml`,
    services: `${baseUrl}/services-rss.xml`,
    atom: `${baseUrl}/atom.xml`,
  }
}

/**
 * Generate HTML link tags for RSS feeds
 */
export function generateRssLinkTags(baseUrl: string): string {
  const feeds = getRssFeedUrls(baseUrl)
  
  return `
    <link rel="alternate" type="application/rss+xml" title="Flow Masters - Блог" href="${feeds.blog}" />
    <link rel="alternate" type="application/rss+xml" title="Flow Masters - Blog (English)" href="${feeds.blogEn}" />
    <link rel="alternate" type="application/rss+xml" title="Flow Masters - Services" href="${feeds.services}" />
    <link rel="alternate" type="application/atom+xml" title="Flow Masters - Atom Feed" href="${feeds.atom}" />
  `.trim()
}

/**
 * Truncate text for RSS descriptions
 */
export function truncateForRss(text: string, maxLength: number = 300): string {
  if (!text) return ''
  
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, '')
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  return plainText.substring(0, maxLength).trim() + '...'
}
