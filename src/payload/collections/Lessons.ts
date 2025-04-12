import type { CollectionConfig } from 'payload/types'
import { slugField } from '@/payload/fields/slug'
import {
  BlocksFeature,
  BoldTextFeature,
  ItalicTextFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical' // Import Lexical features

// --- Define Content Blocks ---

const TextBlock = {
  slug: 'textBlock',
  labels: {
    singular: 'Text Block',
    plural: 'Text Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          // Include standard text formatting features
          ParagraphFeature(),
          BoldTextFeature(),
          ItalicTextFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          LinkFeature(),
          // Remove or add features as needed
        ],
      }),
    },
  ],
}

const ImageBlock = {
  slug: 'imageBlock',
  labels: {
    singular: 'Image Block',
    plural: 'Image Blocks',
  },
  fields: [
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media', // Links to the 'media' collection
      required: true,
    },
    {
      name: 'caption',
      label: 'Caption',
      type: 'text',
      localized: true,
    },
  ],
}

// Add Code Block definition
const CodeBlock = {
  slug: 'codeBlock',
  labels: {
    singular: 'Code Block',
    plural: 'Code Blocks',
  },
  fields: [
    {
      name: 'language',
      label: 'Language',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'JSON', value: 'json' },
        { label: 'Markdown', value: 'markdown' },
        { label: 'Python', value: 'python' },
        { label: 'Shell', value: 'shell' },
        // Add more languages as needed
      ],
      defaultValue: 'none',
      admin: {
        description: 'Select the programming language for syntax highlighting.',
      },
    },
    {
      name: 'code',
      label: 'Code Snippet',
      type: 'code',
      required: true,
      admin: {
        language: '{{language}}', // Dynamically set based on the language field
      },
    },
  ],
}

// --- Lesson Collection Definition ---
