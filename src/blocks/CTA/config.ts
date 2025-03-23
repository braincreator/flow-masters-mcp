import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CTA: Block = {
  slug: 'cta',
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'actions',
      type: 'array',
      fields: [
        {
          name: 'actionType',
          type: 'text',
          defaultValue: 'link',
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Reference', value: 'reference' },
            { label: 'Custom URL', value: 'custom' },
          ],
          required: true,
        },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: ['pages', 'posts'],
          admin: {
            condition: (data) => data?.type === 'reference',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (data) => data?.type === 'custom',
          },
        },
        {
          name: 'appearance',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Outline', value: 'outline' },
          ],
        },
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'Open in new tab',
        },
      ],
    },
  ],
  interfaceName: 'CTABlock',
}