import { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone' // Corrected import path
import { authenticated } from '../../access/authenticated'
import { ServiceRegistry } from '@/services/service.registry'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  ParagraphFeature,
  HeadingFeature,
  LinkFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
} from '@payloadcms/richtext-lexical'

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
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          const serviceRegistry = ServiceRegistry.getInstance(req.payload)
          const integrationService = serviceRegistry.getIntegrationService()
          // Only trigger for form submissions, not form configuration changes
          if (doc.submissionData) {
            await integrationService.processEvent('form.submitted', {
              formId: doc.id,
              formTitle: doc.title,
              submission: doc.submissionData,
              submittedAt: doc.createdAt,
            })
          }
        }
      },
    ],
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
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            // Базовое форматирование текста
            BoldFeature(),
            ItalicFeature(),
            UnderlineFeature(),

            // Структура документа
            ParagraphFeature(),
            HeadingFeature({
              enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'],
            }),

            // Ссылки
            LinkFeature(),

            // Панели инструментов
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      required: true,
      label: 'Сообщение подтверждения',
      admin: {
        description:
          'Сообщение, которое увидит пользователь после отправки формы. Поддерживает форматирование текста.',
      },
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
