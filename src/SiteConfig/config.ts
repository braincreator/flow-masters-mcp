import type { GlobalConfig } from 'payload'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { encryptValue, decryptValue } from '../utilities/encryption'

export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Settings',
  },
  hooks: {
    beforeRead: [
      async ({ req }) => {
        // Just return without trying to create default config
        // Default values will be handled by field definitions
        return
      }
    ],
    beforeChange: [
      async ({ data }) => {
        // Encrypt sensitive data before saving
        const newData = { ...data }
        
        if (newData.analytics?.googleAnalyticsId) {
          newData.analytics.googleAnalyticsId = await encryptValue(newData.analytics.googleAnalyticsId)
        }
        if (newData.analytics?.googleTagManagerId) {
          newData.analytics.googleTagManagerId = await encryptValue(newData.analytics.googleTagManagerId)
        }
        if (newData.analytics?.metaPixelId) {
          newData.analytics.metaPixelId = await encryptValue(newData.analytics.metaPixelId)
        }
        if (newData.security?.reCaptcha?.secretKey) {
          newData.security.reCaptcha.secretKey = await encryptValue(newData.security.reCaptcha.secretKey)
        }
        if (newData.smtp?.password) {
          newData.smtp.password = await encryptValue(newData.smtp.password)
        }
        if (newData.features?.newsletter?.apiKey) {
          newData.features.newsletter.apiKey = await encryptValue(newData.features.newsletter.apiKey)
        }
        if (newData.features?.search?.apiKey) {
          newData.features.search.apiKey = await encryptValue(newData.features.search.apiKey)
        }
        return newData
      }
    ],
    afterRead: [
      async ({ doc }) => {
        // Decrypt sensitive data after reading
        const newDoc = { ...doc }
        
        if (newDoc.analytics?.googleAnalyticsId) {
          newDoc.analytics.googleAnalyticsId = await decryptValue(newDoc.analytics.googleAnalyticsId)
        }
        if (newDoc.analytics?.googleTagManagerId) {
          newDoc.analytics.googleTagManagerId = await decryptValue(newDoc.analytics.googleTagManagerId)
        }
        if (newDoc.analytics?.metaPixelId) {
          newDoc.analytics.metaPixelId = await decryptValue(newDoc.analytics.metaPixelId)
        }
        if (newDoc.security?.reCaptcha?.secretKey) {
          newDoc.security.reCaptcha.secretKey = await decryptValue(newDoc.security.reCaptcha.secretKey)
        }
        if (newDoc.smtp?.password) {
          newDoc.smtp.password = await decryptValue(newDoc.smtp.password)
        }
        if (newDoc.features?.newsletter?.apiKey) {
          newDoc.features.newsletter.apiKey = await decryptValue(newDoc.features.newsletter.apiKey)
        }
        if (newDoc.features?.search?.apiKey) {
          newDoc.features.search.apiKey = await decryptValue(newDoc.features.search.apiKey)
        }
        return newDoc
      }
    ],
    afterChange: [
      async ({ doc, req: { payload } }) => {
        try {
          // Revalidate cache after config changes
          await fetch('/api/revalidate?tag=site-config', {
            method: 'POST',
          })
          payload.logger.info('Revalidated site config cache')
        } catch (err) {
          payload.logger.error(`Error revalidating site config: ${err}`)
        }
        return doc
      }
    ]
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: false,
            },
            {
              name: 'description',
              type: 'textarea',
              required: false,
            },
            {
              name: 'company',
              type: 'group',
              fields: [
                {
                  name: 'legalName',
                  type: 'text',
                },
                {
                  name: 'foundedYear',
                  type: 'number',
                },
                {
                  name: 'taxId',
                  type: 'text',
                },
                {
                  name: 'registrationNumber',
                  type: 'text',
                },
                {
                  name: 'vatNumber',
                  type: 'text',
                }
              ]
            },
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                },
                {
                  name: 'phone',
                  type: 'text',
                },
                {
                  name: 'address',
                  type: 'textarea',
                },
                {
                  name: 'workingHours',
                  type: 'text',
                },
                {
                  name: 'googleMapsUrl',
                  type: 'text',
                }
              ]
            },
            {
              name: 'localization',
              type: 'group',
              fields: [
                {
                  name: 'defaultTimeZone',
                  type: 'text',
                  defaultValue: 'UTC',
                },
                {
                  name: 'dateFormat',
                  type: 'select',
                  defaultValue: 'DD/MM/YYYY',
                  options: [
                    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
                    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
                  ],
                },
                {
                  name: 'timeFormat',
                  type: 'select',
                  defaultValue: '24',
                  options: [
                    { label: '24-hour', value: '24' },
                    { label: '12-hour', value: '12' },
                  ],
                }
              ]
            }
          ]
        },
        {
          label: 'Branding',
          fields: [
            {
              name: 'branding',
              type: 'group',
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  required: false,  // Changed from true to false
                },
                {
                  name: 'favicon',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'colors',
                  type: 'group',
                  fields: [
                    {
                      name: 'primary',
                      type: 'text',
                      defaultValue: '#000000',
                    },
                    {
                      name: 'secondary',
                      type: 'text',
                      defaultValue: '#ffffff',
                    },
                    {
                      name: 'accent',
                      type: 'text',
                      defaultValue: '#000000',
                    }
                  ]
                },
                {
                  name: 'fonts',
                  type: 'group',
                  fields: [
                    {
                      name: 'primary',
                      type: 'text',
                      defaultValue: 'Inter',
                    },
                    {
                      name: 'secondary',
                      type: 'text',
                      defaultValue: 'Georgia',
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socialLinks',
              type: 'group',
              fields: [
                {
                  name: 'twitter',
                  type: 'text',
                },
                {
                  name: 'linkedin',
                  type: 'text',
                },
                {
                  name: 'facebook',
                  type: 'text',
                },
                {
                  name: 'instagram',
                  type: 'text',
                },
                {
                  name: 'youtube',
                  type: 'text',
                },
                {
                  name: 'telegram',
                  type: 'text',
                }
              ]
            }
          ]
        },
        {
          label: 'SEO & Analytics',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                {
                  name: 'defaultMetaTitle',
                  type: 'text',
                },
                {
                  name: 'defaultMetaDescription',
                  type: 'textarea',
                },
                {
                  name: 'defaultOgImage',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'robotsTxt',
                  type: 'code',
                  admin: {
                    language: 'text',
                  }
                },
                {
                  name: 'jsonLd',
                  type: 'code',
                  admin: {
                    language: 'json',
                  }
                },
                {
                  name: 'defaultGoogleVerification',
                  type: 'text',
                  admin: {
                    description: 'Google Search Console verification code'
                  }
                },
                {
                  name: 'defaultYandexVerification',
                  type: 'text',
                  admin: {
                    description: 'Yandex Webmaster verification code'
                  }
                }
              ]
            },
            {
              name: 'analytics',
              type: 'group',
              fields: [
                {
                  name: 'googleAnalyticsId',
                  type: 'text',
                  admin: {
                    description: 'Google Analytics Measurement ID (G-XXXXXXXXXX)',
                  }
                },
                {
                  name: 'googleTagManagerId',
                  type: 'text',
                  admin: {
                    description: 'Google Tag Manager ID (GTM-XXXXXX)',
                  }
                },
                {
                  name: 'metaPixelId',
                  type: 'text',
                  admin: {
                    description: 'Meta (Facebook) Pixel ID',
                  }
                }
              ]
            }
          ]
        },
        {
          label: 'Features',
          fields: [
            {
              name: 'features',
              type: 'group',
              fields: [
                {
                  name: 'blog',
                  type: 'group',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'postsPerPage',
                      type: 'number',
                      defaultValue: 10,
                      min: 1,
                      max: 50,
                    },
                    {
                      name: 'enableComments',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'moderateComments',
                      type: 'checkbox',
                      defaultValue: true,
                    }
                  ]
                },
                {
                  name: 'newsletter',
                  type: 'group',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'provider',
                      type: 'select',
                      options: [
                        { label: 'Mailchimp', value: 'mailchimp' },
                        { label: 'SendGrid', value: 'sendgrid' },
                        { label: 'Custom', value: 'custom' },
                      ]
                    },
                    {
                      name: 'apiKey',
                      type: 'text',
                      admin: {
                        condition: (data, siblingData) => siblingData?.provider !== 'custom',
                      }
                    },
                    {
                      name: 'listId',
                      type: 'text',
                      admin: {
                        condition: (data, siblingData) => siblingData?.provider !== 'custom',
                      }
                    }
                  ]
                },
                {
                  name: 'search',
                  type: 'group',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'provider',
                      type: 'select',
                      options: [
                        { label: 'Algolia', value: 'algolia' },
                        { label: 'MeiliSearch', value: 'meilisearch' },
                      ]
                    },
                    {
                      name: 'apiKey',
                      type: 'text',
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'Security',
          fields: [
            {
              name: 'security',
              type: 'group',
              fields: [
                {
                  name: 'reCaptcha',
                  type: 'group',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'siteKey',
                      type: 'text',
                      admin: {
                        condition: (data, siblingData) => siblingData?.enabled,
                      }
                    },
                    {
                      name: 'secretKey',
                      type: 'text',
                      admin: {
                        condition: (data, siblingData) => siblingData?.enabled,
                      }
                    }
                  ]
                },
                {
                  name: 'cors',
                  type: 'array',
                  fields: [
                    {
                      name: 'origin',
                      type: 'text',
                      required: true,
                    }
                  ]
                },
                {
                  name: 'rateLimiting',
                  type: 'group',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'maxRequests',
                      type: 'number',
                      defaultValue: 100,
                      admin: {
                        condition: (data, siblingData) => siblingData?.enabled,
                      }
                    },
                    {
                      name: 'timeWindow',
                      type: 'number',
                      defaultValue: 15,
                      admin: {
                        description: 'Time window in minutes',
                        condition: (data, siblingData) => siblingData?.enabled,
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          label: 'Email',
          fields: [
            {
              name: 'smtp',
              type: 'group',
              fields: [
                {
                  name: 'host',
                  type: 'text',
                },
                {
                  name: 'port',
                  type: 'number',
                  defaultValue: 587,
                },
                {
                  name: 'user',
                  type: 'text',
                },
                {
                  name: 'password',
                  type: 'text',
                },
                {
                  name: 'fromEmail',
                  type: 'email',
                },
                {
                  name: 'fromName',
                  type: 'text',
                }
              ]
            }
          ]
        },
        {
          label: 'Performance',
          fields: [
            {
              name: 'performance',
              type: 'group',
              fields: [
                {
                  name: 'cache',
                  type: 'group',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'ttl',
                      type: 'number',
                      defaultValue: 3600,
                      admin: {
                        description: 'Time to live in seconds',
                        condition: (data, siblingData) => siblingData?.enabled,
                      }
                    }
                  ]
                },
                {
                  name: 'images',
                  type: 'group',
                  fields: [
                    {
                      name: 'optimization',
                      type: 'select',
                      defaultValue: 'balanced',
                      options: [
                        { label: 'Quality Priority', value: 'quality' },
                        { label: 'Balanced', value: 'balanced' },
                        { label: 'Performance Priority', value: 'performance' },
                      ]
                    },
                    {
                      name: 'lazyLoading',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'placeholders',
                      type: 'select',
                      defaultValue: 'blur',
                      options: [
                        { label: 'Blur', value: 'blur' },
                        { label: 'Color', value: 'color' },
                        { label: 'None', value: 'none' },
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
