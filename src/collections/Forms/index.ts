import { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'

export const Forms: CollectionConfig = {
  slug: 'forms',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'fields',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'width',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 100,
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'blockType',
          type: 'select',
          required: true,
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Textarea', value: 'textarea' },
            { label: 'Email', value: 'email' },
            { label: 'Number', value: 'number' },
            { label: 'Select', value: 'select' },
            { label: 'Checkbox', value: 'checkbox' },
            { label: 'Country', value: 'country' },
            { label: 'State', value: 'state' },
          ],
        },
        {
          name: 'options',
          type: 'array',
          admin: {
            condition: (data, siblingData) => siblingData?.blockType === 'select',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'confirmationMessage',
      type: 'richText',
      required: true,
    },
    {
      name: 'emailTo',
      type: 'array',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
      ],
    },
  ],
}