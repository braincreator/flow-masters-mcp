import { CollectionConfig } from 'payload/types'
import { isAdmin } from '../../access/isAdmin'
import { generateApiKey } from '../../utilities/auth'
import { IntegrationTemplates } from './templates'
import { DynamicConfigFields } from './components/DynamicConfigFields'
import { TestIntegration } from './components/TestIntegration'
import { IntegrationEvents } from '../../types/events'

export const Integrations: CollectionConfig = {
  slug: 'integrations',
  admin: {
    useAsTitle: 'name',
    group: 'System',
    defaultColumns: ['name', 'template', 'status', 'lastSync'],
    components: {
      BeforeList: TestIntegration,
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'template',
      type: 'select',
      required: true,
      options: IntegrationTemplates.map(template => ({
        label: template.label,
        value: template.slug,
      })),
      admin: {
        description: 'Choose a pre-built integration template or create a custom one',
      },
    },
    {
      name: 'config',
      type: 'group',
      admin: {
        components: {
          Field: DynamicConfigFields,
        },
      },
      fields: [
        {
          name: '_template',
          type: 'text',
          admin: {
            hidden: true,
          },
        },
      ],
    },
    {
      name: 'triggers',
      type: 'array',
      admin: {
        description: 'When should this integration run?',
      },
      fields: [
        {
          name: 'event',
          type: 'select',
          required: true,
          hasMany: true,
          options: [
            { label: 'Order Created', value: IntegrationEvents.ORDER_CREATED },
            { label: 'Order Updated', value: IntegrationEvents.ORDER_UPDATED },
            { label: 'Order Status Updated', value: IntegrationEvents.ORDER_STATUS_UPDATED },
            { label: 'Payment Received', value: IntegrationEvents.PAYMENT_RECEIVED },
            { label: 'User Registered', value: IntegrationEvents.USER_REGISTERED },
            { label: 'Form Submitted', value: IntegrationEvents.FORM_SUBMITTED },
            { label: 'Product Created', value: IntegrationEvents.PRODUCT_CREATED },
            { label: 'Product Updated', value: IntegrationEvents.PRODUCT_UPDATED },
            { label: 'Contact Created', value: IntegrationEvents.CONTACT_CREATED },
            { label: 'CRM Contact Created', value: IntegrationEvents.CRM_CONTACT_CREATED },
            { label: 'Custom Event', value: IntegrationEvents.CUSTOM },
          ],
        },
        {
          name: 'conditions',
          type: 'array',
          admin: {
            description: 'Optional: Only run if these conditions are met',
          },
          fields: [
            {
              name: 'field',
              type: 'text',
              required: true,
            },
            {
              name: 'operator',
              type: 'select',
              required: true,
              options: [
                { label: 'Equals', value: 'eq' },
                { label: 'Not Equals', value: 'ne' },
                { label: 'Greater Than', value: 'gt' },
                { label: 'Less Than', value: 'lt' },
                { label: 'Contains', value: 'contains' },
              ],
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
      name: 'actions',
      type: 'array',
      admin: {
        description: 'What should happen when triggered?',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Send HTTP Request', value: 'http' },
            { label: 'Create Record', value: 'create' },
            { label: 'Update Record', value: 'update' },
            { label: 'Send Email', value: 'email' },
            { label: 'Run Custom Code', value: 'code' },
          ],
        },
        {
          name: 'config',
          type: 'group',
          admin: {
            components: {
              Field: DynamicConfigFields,
            },
          },
          fields: [] // Dynamic fields based on action type
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Draft', value: 'draft' },
      ],
    },
    {
      name: 'apiKey',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Use this key to authenticate incoming webhooks',
      },
      hooks: {
        beforeChange: [
          ({ value, operation }) => {
            if (operation === 'create') {
              return generateApiKey()
            }
            return value
          },
        ],
      },
    },
  ],
}
