const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://flow-masters.ru'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: [
    '/posts-sitemap.xml',
    '/pages-sitemap.xml',
    '/services-sitemap.xml',
    '/admin/*',
    '/api/*',
    '/_next/*',
    '/ru/admin/*',
    '/en/admin/*',
    '/payload/*',
    '/*.json',
    '/*.xml'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: [
          '/admin/*',
          '/api/*',
          '/_next/*',
          '/payload/*',
          '/*.json',
          '/*.xml'
        ],
        allow: [
          '/api/webhooks/*',
          '/sitemap.xml',
          '/robots.txt'
        ]
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/*', '/api/*', '/payload/*']
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/admin/*', '/api/*', '/payload/*']
      }
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`,
      `${SITE_URL}/posts-sitemap.xml`,
      `${SITE_URL}/services-sitemap.xml`
    ],
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  transform: async (config, path) => {
    // Настройка приоритетов для разных типов страниц
    let priority = 0.7
    let changefreq = 'weekly'

    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path.includes('/services/')) {
      priority = 0.9
      changefreq = 'weekly'
    } else if (path.includes('/posts/')) {
      priority = 0.8
      changefreq = 'weekly'
    } else if (path.includes('/courses/')) {
      priority = 0.8
      changefreq = 'weekly'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: [
        {
          href: `${SITE_URL}/ru${path === '/' ? '' : path}`,
          hreflang: 'ru',
        },
        {
          href: `${SITE_URL}/en${path === '/' ? '' : path}`,
          hreflang: 'en',
        },
      ],
    }
  },
}
