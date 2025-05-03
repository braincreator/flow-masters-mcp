import type { Block, RelationshipField } from 'payload'
import { Forms } from '@/collections/Forms' // Added import

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

// Define the form field with explicit typing
const formField: RelationshipField = {
  name: 'form',
  type: 'relationship',
  relationTo: Forms.slug, // Changed from 'forms'
  required: true,
}

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    // Use the explicitly typed constant for the form relationship
    formField,
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        // Add explicit types for condition parameters
        condition: (_: any, { enableIntro }: { enableIntro?: boolean }) => Boolean(enableIntro),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Form Blocks',
    singular: 'Form Block',
  },
}
