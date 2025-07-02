import { NextResponse } from 'next/server'

/**
 * Sitemaps Index - главный файл, ссылающийся на все sitemap
 * Включает как стандартные sitemap, так и LLM-оптимизированные
 * Доступен по адресу /sitemaps-index.xml
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
  const currentDate = new Date().toISOString()

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Основные sitemap -->
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${baseUrl}/pages-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${baseUrl}/posts-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${baseUrl}/services-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Локализованные sitemap -->
  <sitemap>
    <loc>${baseUrl}/ru-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${baseUrl}/en-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- LLM-оптимизированные sitemap -->
  <sitemap>
    <loc>${baseUrl}/api/llm/sitemap?format=xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <!-- Специализированные sitemap -->
  <sitemap>
    <loc>${baseUrl}/images-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${baseUrl}/news-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
