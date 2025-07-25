import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'
import { populateReadingTime } from './hooks/populateReadingTime'
import { revalidateSitemap, revalidateSitemapDelete } from '@/hooks/revalidateSitemap'
import { ServiceRegistry } from '@/services/service.registry'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from '@/fields/slug'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    readingTime: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    group: 'Blog & Publications',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'posts',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'excerpt',
              type: 'textarea',
              maxLength: 160,
              label: 'Excerpt (short description)',
              admin: {
                description: 'A short summary of the post (max 160 characters).',
              },
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              label: 'Thumbnail Image',
              admin: {
                description: 'Square image for post cards and previews.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
            {
              name: 'readingTime',
              label: 'Reading Time (minutes)',
              type: 'number',
              admin: {
                readOnly: true,
                position: 'sidebar',
                description: 'Automatically calculated based on content length.',
                condition: (data) => data.readingTime,
              },
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
            {
              name: 'tags',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'tags',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },

    ...slugField(),
  ],
  hooks: {
    beforeChange: [populateReadingTime],
    afterChange: [
      revalidatePost,
      revalidateSitemap,
      // Добавляем хук для событий постов
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания поста
          await eventService.publishEvent('post.created', {
            id: doc.id,
            title: doc.title,
            slug: doc.slug,
            excerpt: doc.excerpt,
            categories: doc.categories,
            tags: doc.tags,

            publishedAt: doc.publishedAt,
            _status: doc._status,
            createdAt: doc.createdAt,
          }, {
            source: 'post_creation',
            collection: 'posts',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие публикации поста
          if (doc._status === 'published' && previousDoc._status === 'draft') {
            await eventService.publishEvent('post.published', {
              id: doc.id,
              title: doc.title,
              slug: doc.slug,
              excerpt: doc.excerpt,
              categories: doc.categories,
              tags: doc.tags,

              publishedAt: doc.publishedAt,
              readingTime: doc.readingTime,
            }, {
              source: 'post_publication',
              collection: 'posts',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          } else if (doc._status === 'published') {
            // Событие обновления опубликованного поста
            await eventService.publishEvent('post.updated', {
              id: doc.id,
              title: doc.title,
              slug: doc.slug,
              excerpt: doc.excerpt,
              categories: doc.categories,
              tags: doc.tags,

              publishedAt: doc.publishedAt,
              readingTime: doc.readingTime,
              updatedAt: new Date().toISOString(),
            }, {
              source: 'post_update',
              collection: 'posts',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
    afterRead: [],
    afterDelete: [revalidateDelete, revalidateSitemapDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
