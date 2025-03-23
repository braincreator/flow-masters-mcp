import { Field } from 'payload'

export type ActionType = 'link' | 'button'

export const actionGroup = ({
  overrides = {},
  appearances = ['default', 'primary', 'secondary', 'outline', 'ghost'],
} = {}): Field => ({
  name: 'actions',
  type: 'array',
  fields: [
    {
      name: 'actionType',
      type: 'select',
      defaultValue: 'link',
      options: [
        { label: 'Link', value: 'link' },
        { label: 'Button', value: 'button' },
      ],
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'reference',
      options: [
        { label: 'Reference', value: 'reference' },
        { label: 'Custom URL', value: 'custom' },
      ],
    },
    {
      name: 'reference',
      type: 'relationship',
      relationTo: ['pages', 'posts'],
      admin: {
        condition: (_, { type }) => type === 'reference',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, { type }) => type === 'custom',
      },
    },
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'default',
      options: appearances.map(value => ({ label: value.charAt(0).toUpperCase() + value.slice(1), value })),
    },
    {
      name: 'newTab',
      type: 'checkbox',
      label: 'Open in new tab',
    },
    {
      name: 'icon',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Arrow Right', value: 'arrow-right' },
        { label: 'External Link', value: 'external-link' },
        { label: 'Download', value: 'download' },
      ],
      defaultValue: 'none',
    },
  ],
  ...overrides,
})