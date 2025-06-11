import type { Plugin } from 'payload'
import type { Field } from 'payload' // Correct import path for Field
import type { Page, Post } from '@/payload-types'

import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { s3Storage } from '@payloadcms/storage-s3'
// import { betterLocalizedFields } from '@payload-enchants/better-localized-fields' // Temporarily disabled due to compatibility issues

import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { getServerSideURL } from '@/utilities/getURL'

// Define SEO utility functions inline
const generateTitle = ({ doc }: { doc: Partial<Page> | Partial<Post> | null }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL = ({ doc }: { doc: Partial<Page> | Partial<Post> | null }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}

// Conditionally return an empty array during type generation
export const plugins: Plugin[] =
  process.env.IS_GENERATING_TYPES === 'true'
    ? []
    : [
        redirectsPlugin({
          // Restore redirectsPlugin
          collections: ['pages', 'posts'],
          overrides: {
            admin: { group: 'Admin' },
            fields: ({ defaultFields }): Field[] => {
              return defaultFields.map((field) => {
                if ('name' in field && field.name === 'from') {
                  return {
                    ...field,
                    admin: {
                      ...(field.admin || {}),
                      description: 'You will need to rebuild the website when changing this field.',
                    },
                  } as Field
                }
                return field
              })
            },
            hooks: {
              afterChange: [revalidateRedirects],
            },
          },
        }),
        nestedDocsPlugin({
          collections: ['categories'],
          generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
        }),
        seoPlugin({
          generateTitle,
          generateURL,
        }),
        // formBuilderPlugin({
        //   fields: {
        //     payment: false,
        //   },
        //   formOverrides: {
        //     fields: ({ defaultFields }) => {
        //       return defaultFields.map((field) => {
        //         if ('name' in field && field.name === 'confirmationMessage') {
        //           return {
        //             ...field,
        //             editor: lexicalEditor({
        //               features: ({ rootFeatures }) => {
        //                 return [
        //                   ...rootFeatures,
        //                   FixedToolbarFeature(),
        //                   HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
        //                 ]
        //               },
        //             }),
        //           }
        //         }
        //         return field
        //       })
        //     },
        //   },
        // }),
        searchPlugin({
          collections: ['posts'],
        }),
        payloadCloudPlugin(),
        // betterLocalizedFields(), // Temporarily disabled due to compatibility issues
        s3Storage({
          collections: {
            media: {
              disableLocalStorage: true,
              // Remove disablePayloadAccessControl to respect Media collection access control
              generateFileURL: ({ filename }) => {
                // All files are stored at root level, not in size-specific folders
                // This fixes the issue where CMS tries to load /thumbnail/filename
                // but files are actually stored at /filename
                const bucket = process.env.S3_BUCKET || 'flow-masters-bucket'
                const endpoint = process.env.S3_ENDPOINT || 's3.cloud.ru'
                return `https://${bucket}.${endpoint}/${filename}`
              },
            },
          },
          bucket: process.env.S3_BUCKET || 'flow-masters-bucket',
          config: {
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
            endpoint: `https://${process.env.S3_ENDPOINT || 's3.cloud.ru'}`,
            region: process.env.S3_REGION || 'ru-central-1',
          },
        }),
      ]
