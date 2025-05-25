import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'Content Management',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    preview: (doc) => {
      // Use type assertion for better TypeScript compatibility
      const mediaDoc = doc as Record<string, unknown> & {
        url?: string
      }
      // Since all files are stored at root level, always use the main URL
      // This fixes the issue where thumbnail URLs don't exist in S3
      return mediaDoc?.url || ''
    },
  },
  upload: {
    disableLocalStorage: true,
    adminThumbnail: ({ doc }) => {
      // Use type assertion for better TypeScript compatibility
      const mediaDoc = doc as Record<string, unknown> & {
        url?: string
      }
      // Since all files are stored at root level, always use the main URL
      // This fixes the issue where thumbnail URLs don't exist in S3
      return mediaDoc?.url || ''
    },
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        // withoutEnlargement: true,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
        crop: 'center',
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
}
