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

import { 
  FixedToolbarFeature, 
  HeadingFeature, 
  lexicalEditor 
} from '@payloadcms/richtext-lexical'

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

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'], // Restore 'posts'
    // Restore admin config
    admin: {
      group: 'Admin'
    },
    // Restore overrides
    overrides: {
      fields: ({ defaultFields }) => {
        // Remove explicit Field types and let TS infer
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            // Return the modified field directly
            return {
              ...field,
              admin: {
                ...(field.admin || {}), // Safely merge existing admin properties
                description: 'You will need to rebuild the website when changing this field.',
              },
            };
          }
          return field;
        });
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
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'], // Ensure 'posts' is here if searchPlugin uses it
    // Remove the incorrect top-level 'fields' array.
    // Configuring which 'posts' fields are indexed is done elsewhere.
    // searchOverrides: {}, // Keep if other search collection overrides are needed
  }),
  payloadCloudPlugin(),
  s3Storage({
    collections: {
      media: {
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
        generateFileURL: ({ collection, filename, prefix, size }) => {
          const sizeName = size?.name || ''
          const sizePrefix = sizeName ? `${sizeName}/` : ''

          // Construct the correct S3 URL with the full bucket path
          return `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}/${sizePrefix}${filename}`
        },
      },
    },
    bucket: process.env.S3_BUCKET!,
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      endpoint: `https://${process.env.S3_ENDPOINT}`,  // Make sure to include https://
      forcePathStyle: false,  // Set this to false for virtual-hosted style URLs
      region: process.env.S3_REGION,
    },
  }),
]
